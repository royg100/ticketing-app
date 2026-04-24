import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) =>
    ctx.db.query('ticketTypes').withIndex('by_event', q => q.eq('eventId', eventId)).collect(),
});

export const create = mutation({
  args: {
    eventId: v.id('events'),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    saleStart: v.optional(v.string()),
    saleEnd: v.optional(v.string()),
    minPerOrder: v.number(),
    maxPerOrder: v.number(),
  },
  handler: async (ctx, args) => ctx.db.insert('ticketTypes', { ...args, sold: 0 }),
});

export const update = mutation({
  args: {
    id: v.id('ticketTypes'),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    quantity: v.optional(v.number()),
    sold: v.optional(v.number()),
    description: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    saleStart: v.optional(v.string()),
    saleEnd: v.optional(v.string()),
    minPerOrder: v.optional(v.number()),
    maxPerOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const cleaned = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    await ctx.db.patch(id, cleaned);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id('ticketTypes') },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
