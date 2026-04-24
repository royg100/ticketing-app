import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) =>
    ctx.db.query('coupons').withIndex('by_event', q => q.eq('eventId', eventId)).collect(),
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) =>
    ctx.db.query('coupons').withIndex('by_code', q => q.eq('code', code.toUpperCase())).first(),
});

/** קופון שתקף לקופה עבור אירוע (לסליקה) */
export const getForEvent = query({
  args: { eventId: v.id('events'), code: v.string() },
  handler: async (ctx, { eventId, code }) => {
    const c = await ctx.db
      .query('coupons')
      .withIndex('by_code', (q) => q.eq('code', code.toUpperCase()))
      .first();
    if (!c || c.eventId !== eventId) return null;
    if (!c.enabled) return null;
    if (c.usedCount >= c.usageLimit) return null;
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return null;
    return c;
  },
});

export const create = mutation({
  args: {
    eventId: v.id('events'),
    code: v.string(),
    type: v.union(v.literal('percent'), v.literal('fixed')),
    value: v.number(),
    usageLimit: v.number(),
    expiresAt: v.optional(v.string()),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => ctx.db.insert('coupons', { ...args, usedCount: 0 }),
});

export const update = mutation({
  args: {
    id: v.id('coupons'),
    code: v.optional(v.string()),
    type: v.optional(v.union(v.literal('percent'), v.literal('fixed'))),
    value: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    usedCount: v.optional(v.number()),
    expiresAt: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const cleaned = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    await ctx.db.patch(id, cleaned);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id('coupons') },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
