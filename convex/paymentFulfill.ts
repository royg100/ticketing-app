import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Webhook: אומתה תשלום ב-Stripe — עסקה, אירוע, קופון, סגירת טיוטה (באותו mutation).
 */
export const fulfillDraft = internalMutation({
  args: {
    draftId: v.id('checkoutDrafts'),
    stripeSessionId: v.string(),
    amountTotalAgurot: v.number(),
  },
  handler: async (ctx, { draftId, stripeSessionId, amountTotalAgurot }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft || draft.status !== 'pending') {
      return { ok: false as const, reason: 'invalid_draft' as const };
    }
    if (draft.amountAgurot !== amountTotalAgurot) {
      return { ok: false as const, reason: 'amount_mismatch' as const };
    }

    const existing = await ctx.db
      .query('transactions')
      .withIndex('by_stripe_session', (q) => q.eq('stripeSessionId', stripeSessionId))
      .first();
    if (existing) {
      await ctx.db.patch(draftId, { status: 'consumed' });
      return { ok: true as const, transactionId: existing._id, duplicate: true as const };
    }

    let couponCode: string | undefined;
    if (draft.couponId) {
      const c = await ctx.db.get(draft.couponId);
      couponCode = c?.code;
    }

    const qrCode = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const transactionId = await ctx.db.insert('transactions', {
      eventId: draft.eventId,
      buyerName: draft.buyerName,
      buyerEmail: draft.buyerEmail,
      buyerPhone: draft.buyerPhone,
      tickets: draft.tickets,
      total: draft.grandTotal,
      fee: draft.serviceFee,
      status: 'success',
      createdAt: new Date().toLocaleDateString('he-IL'),
      checkInStatus: 'pending',
      qrCode,
      stripeSessionId,
      coupon: couponCode,
    });

    const event = await ctx.db.get(draft.eventId);
    if (event) {
      const qty = draft.tickets.reduce((s, t) => s + t.quantity, 0);
      await ctx.db.patch(draft.eventId, {
        soldTickets: event.soldTickets + qty,
        revenue: event.revenue + draft.grandTotal,
      });
    }

    if (draft.couponId) {
      const c = await ctx.db.get(draft.couponId);
      if (c) await ctx.db.patch(draft.couponId, { usedCount: c.usedCount + 1 });
    }

    await ctx.db.patch(draftId, { status: 'consumed' });
    return { ok: true as const, transactionId, duplicate: false as const };
  },
});
