import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

export const create = internalMutation({
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
    subtotal: v.number(),
    discount: v.number(),
    serviceFee: v.number(),
    grandTotal: v.number(),
    amountAgurot: v.number(),
    couponId: v.optional(v.id('coupons')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('checkoutDrafts', {
      ...args,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });
  },
});
