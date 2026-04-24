import { mutation } from './_generated/server';
import { v } from 'convex/values';

const SERVICE_FEE = 0.05;

/**
 * הזמנה "בנתיים" דרך ביט: הלקוח שולח כסף באפליקציית ביט למספר שמציגים באתר.
 * אין אימות API — רישום transaction במצב pending_bit, בלי soldTickets.
 */
export const createPending = mutation({
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
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('האירוע לא נמצא');

    let subtotal = 0;
    for (const t of args.tickets) {
      if (t.quantity < 1 || t.quantity > 20) throw new Error('כמות לא חוקית לפריט');
      if (t.unitPrice < 0 || t.unitPrice > 1_000_000) throw new Error('מחיר לא חוקי');
      subtotal += t.unitPrice * t.quantity;
    }
    if (subtotal <= 0) throw new Error('סכום לא חוקי');

    let discount = 0;
    let couponText: string | undefined;
    if (args.couponCode?.trim()) {
      const codeUp = args.couponCode.trim().toUpperCase();
      const c = await ctx.db
        .query('coupons')
        .withIndex('by_code', (q) => q.eq('code', codeUp))
        .first();
      if (
        c &&
        c.eventId === args.eventId &&
        c.enabled &&
        c.usedCount < c.usageLimit &&
        (!c.expiresAt || new Date(c.expiresAt) >= new Date())
      ) {
        couponText = c.code;
        discount =
          c.type === 'percent'
            ? Math.round((subtotal * c.value) / 100)
            : Math.min(c.value, subtotal);
      }
    }

    const after = Math.max(0, subtotal - discount);
    const serviceFee = Math.round(after * SERVICE_FEE);
    const grandTotal = after + serviceFee;
    if (grandTotal < 1) throw new Error('הסכום אחרי הנחה קטן מדי');

    const qrCode = `BIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    const id = await ctx.db.insert('transactions', {
      eventId: args.eventId,
      buyerName: args.buyerName,
      buyerEmail: args.buyerEmail,
      buyerPhone: args.buyerPhone,
      tickets: args.tickets,
      total: grandTotal,
      fee: serviceFee,
      status: 'pending_bit',
      createdAt: new Date().toLocaleDateString('he-IL'),
      checkInStatus: 'pending',
      qrCode,
      coupon: couponText,
    });

    return { transactionId: id, grandTotal, serviceFee, qrCode };
  },
});
