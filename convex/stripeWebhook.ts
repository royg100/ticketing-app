'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import Stripe from 'stripe';

/**
 * בדיקת חתימת webhook של Stripe (חייב Node) ורישום העסקה.
 */
export const processRawEvent = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, { body, signature }) => {
    const { internal } = await import('./_generated/api');
    const key = process.env.STRIPE_SECRET_KEY;
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!key || !whSecret) {
      return { ok: false as const, error: 'stripe_env' as const };
    }

    const stripe = new Stripe(key);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, whSecret);
    } catch {
      return { ok: false as const, error: 'invalid_signature' as const };
    }

    if (event.type !== 'checkout.session.completed') {
      return { ok: true as const, skipped: true as const };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const amountTotal = session.amount_total;
    if (amountTotal == null) return { ok: true as const, skipped: true as const };

    const did = session.metadata?.convexDraftId;
    if (!did) return { ok: true as const, skipped: true as const };

    await ctx.runMutation(internal.paymentFulfill.fulfillDraft, {
      draftId: did as Id<'checkoutDrafts'>,
      stripeSessionId: session.id,
      amountTotalAgurot: amountTotal,
    });
    return { ok: true as const, processed: true as const };
  },
});
