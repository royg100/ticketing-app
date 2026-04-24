// @ts-nocheck — מניעת מעגל TS בין `action` ל־`api` (גם _generated)
'use node';

import { action } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';
import Stripe from 'stripe';

const SERVICE_FEE = 0.05;
/** מינימום ש-Stripe מקבל (שווה ערך ל-~$0.50; ₪1 בדרך כלל נדחה) */
const STRIPE_MIN_GRAND_TOTAL_ILS = 2;
const STRIPE_MIN_AMOUNT_AGUROT = Math.round(STRIPE_MIN_GRAND_TOTAL_ILS * 100);

/**
 * מחליט סכומים בשרת, שומר טיוטה, ופותח דף סליקה ב-Stripe (הפניה).
 * (ייבוא דינמי של `api`/`internal` כדי למנוע מעגל תלויות עם `_generated`.)
 */
export const createCheckoutSession = action({
  args: {
    eventId: v.id('events'),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    tickets: v.array(
      v.object({
        typeName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      }),
    ),
    couponCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { api, internal } = await import('./_generated/api');
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    const site = process.env.SITE_URL?.trim();
    if (!key) {
      throw new Error(
        'חסר STRIPE_SECRET_KEY ב-Convex. Dashboard → Settings → Environment Variables, או: npx convex env set STRIPE_SECRET_KEY "sk_test_..."  (מפתח בדיקה מ- dashboard.stripe.com → Developers → API keys).',
      );
    }
    if (!site) {
      throw new Error(
        'חסר SITE_URL ב-Convex (כתובת הדפדפן אחרי תשלום: Redirect). בפיתוח: npx convex env set SITE_URL "http://localhost:5173"  · בייצור: https://הדומיין-שלכם.il  (ללא / בסוף).',
      );
    }

    const event = await ctx.runQuery(api.events.get, { id: args.eventId });
    if (!event) throw new Error('האירוע לא נמצא');

    let subtotal = 0;
    for (const t of args.tickets) {
      if (t.quantity < 1 || t.quantity > 20) throw new Error('כמות לא חוקית לפריט');
      if (t.unitPrice < 0 || t.unitPrice > 1_000_000) throw new Error('מחיר לא חוקי');
      subtotal += t.unitPrice * t.quantity;
    }
    if (subtotal <= 0) throw new Error('סכום לא חוקי');

    let discount = 0;
    let couponId: Id<'coupons'> | undefined;
    if (args.couponCode?.trim()) {
      const c = await ctx.runQuery(api.coupons.getForEvent, {
        eventId: args.eventId,
        code: args.couponCode.trim(),
      });
      if (c) {
        couponId = c._id;
        discount =
          c.type === 'percent'
            ? Math.round((subtotal * c.value) / 100)
            : Math.min(c.value, subtotal);
      }
    }

    const after = Math.max(0, subtotal - discount);
    const serviceFee = Math.round(after * SERVICE_FEE);
    const grandTotal = after + serviceFee;
    const amountAgurot = Math.round(grandTotal * 100);
    if (amountAgurot < 1) throw new Error('הסכום אחרי הנחה קטן מדי');
    if (amountAgurot < STRIPE_MIN_AMOUNT_AGUROT) {
      throw new Error(
        `מינימום לחיוב ב-Stripe: ₪${STRIPE_MIN_GRAND_TOTAL_ILS} (מגבלת Stripe — סכומים נמוכים מדי). הוסיפו עוד מושב, העלו מחיר, או בחרו תשלום בביט.`,
      );
    }

    const draftId = await ctx.runMutation(internal.paymentDrafts.create, {
      eventId: args.eventId,
      buyerName: args.buyerName,
      buyerEmail: args.buyerEmail,
      buyerPhone: args.buyerPhone,
      tickets: args.tickets,
      subtotal,
      discount,
      serviceFee,
      grandTotal,
      amountAgurot,
      couponId,
    });

    const stripe = new Stripe(key);
    const lineEventName = event.name.length > 180 ? event.name.slice(0, 177) + '…' : event.name;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: {
              name: `כרטיסים: ${lineEventName}`,
            },
            unit_amount: amountAgurot,
          },
          quantity: 1,
        },
      ],
      success_url: `${site.replace(/\/$/, '')}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.replace(/\/$/, '')}/checkout?cancel=1`,
      client_reference_id: String(draftId),
      customer_email: args.buyerEmail,
      metadata: {
        convexDraftId: String(draftId),
      },
    });

    if (!session.url) throw new Error('לא התקבל קישור תשלום מ-Stripe');
    return { url: session.url, draftId: String(draftId) };
  },
});
