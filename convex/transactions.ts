import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query('transactions').order('desc').collect(),
});

export const listByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) =>
    ctx.db.query('transactions').withIndex('by_event', q => q.eq('eventId', eventId)).collect(),
});

export const getByQr = query({
  args: { qrCode: v.string() },
  handler: async (ctx, { qrCode }) =>
    ctx.db.query('transactions').withIndex('by_qr', q => q.eq('qrCode', qrCode)).first(),
});

export const create = mutation({
  args: {
    eventId: v.id('events'),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    tickets: v.array(v.object({ typeName: v.string(), quantity: v.number(), unitPrice: v.number() })),
    total: v.number(),
    fee: v.number(),
    coupon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const qrCode = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const id = await ctx.db.insert('transactions', {
      ...args,
      status: 'success',
      createdAt: new Date().toLocaleDateString('he-IL'),
      checkInStatus: 'pending',
      qrCode,
    });

    const event = await ctx.db.get(args.eventId);
    if (event) {
      const qty = args.tickets.reduce((s, t) => s + t.quantity, 0);
      await ctx.db.patch(args.eventId, {
        soldTickets: event.soldTickets + qty,
        revenue: event.revenue + args.total,
      });
    }
    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id('transactions'),
    status: v.union(
      v.literal('success'),
      v.literal('failed'),
      v.literal('cancelled'),
      v.literal('refunded'),
      v.literal('pending_bit'),
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
    return id;
  },
});

export const checkIn = mutation({
  args: { id: v.id('transactions') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { checkInStatus: 'checked-in' });
    return id;
  },
});
