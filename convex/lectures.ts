import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) =>
    ctx.db.query('lectures').withIndex('by_event', q => q.eq('eventId', eventId)).collect(),
});

export const create = mutation({
  args: {
    eventId: v.id('events'),
    title: v.string(),
    speaker: v.string(),
    location: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    maxCapacity: v.number(),
    description: v.optional(v.string()),
    track: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert('lectures', { ...args, registrations: 0 }),
});

export const update = mutation({
  args: {
    id: v.id('lectures'),
    title: v.optional(v.string()),
    speaker: v.optional(v.string()),
    location: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    registrations: v.optional(v.number()),
    description: v.optional(v.string()),
    track: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const cleaned = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    await ctx.db.patch(id, cleaned);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id('lectures') },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
