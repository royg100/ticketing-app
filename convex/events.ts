import { internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { GenericMutationCtx } from 'convex/server';
import type { DataModel } from './_generated/dataModel';

type MutationCtx = GenericMutationCtx<DataModel>;

/** Public stable id, e.g. evt_a1b2c3d4e5f6 — for APIs and joins; Convex _id remains the table primary key. */
function randomEventKey(): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  let s = 'evt_';
  for (let i = 0; i < 12; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

async function allocEventKey(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const eventKey = randomEventKey();
    const taken = await ctx.db
      .query('events')
      .withIndex('by_eventKey', (q) => q.eq('eventKey', eventKey))
      .first();
    if (!taken) return eventKey;
  }
  throw new Error('eventKey: could not allocate a unique id');
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('events').order('desc').collect();
  },
});

export const listByStatus = query({
  args: { status: v.union(v.literal('draft'), v.literal('active'), v.literal('paused'), v.literal('archived')) },
  handler: async (ctx, { status }) => {
    return await ctx.db.query('events').withIndex('by_status', q => q.eq('status', status)).collect();
  },
});

export const get = query({
  args: { id: v.id('events') },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getByEventKey = query({
  args: { eventKey: v.string() },
  handler: async (ctx, { eventKey }) => {
    return await ctx.db
      .query('events')
      .withIndex('by_eventKey', (q) => q.eq('eventKey', eventKey))
      .first();
  },
});

/** לאפליקציית הלקוח: אירוע לחיוב לדוגמה אם לא הוגדר VITE_CHECKOUT_EVENT_ID */
export const getFirstActiveId = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('events')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    category: v.string(),
    menuGroup: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.union(v.literal('draft'), v.literal('active'), v.literal('paused'), v.literal('archived')),
    image: v.optional(v.string()),
    totalTickets: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDesc: v.optional(v.string()),
    fbPixel: v.optional(v.string()),
    gaId: v.optional(v.string()),
    cancelPolicy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventKey = await allocEventKey(ctx);
    return await ctx.db.insert('events', {
      ...args,
      eventKey,
      totalTickets: args.totalTickets ?? 0,
      soldTickets: 0,
      revenue: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('events'),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    venue: v.optional(v.string()),
    category: v.optional(v.string()),
    menuGroup: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('active'), v.literal('paused'), v.literal('archived'))),
    image: v.optional(v.string()),
    totalTickets: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDesc: v.optional(v.string()),
    fbPixel: v.optional(v.string()),
    gaId: v.optional(v.string()),
    cancelPolicy: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const current = await ctx.db.get(id);
    if (current && !current.eventKey) {
      await ctx.db.patch(id, { eventKey: await allocEventKey(ctx) });
    }
    const cleaned = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(id, cleaned);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id('events') },
  handler: async (ctx, { id }) => {
    const ticketTypes = await ctx.db.query('ticketTypes').withIndex('by_event', q => q.eq('eventId', id)).collect();
    const coupons = await ctx.db.query('coupons').withIndex('by_event', q => q.eq('eventId', id)).collect();
    const lectures = await ctx.db.query('lectures').withIndex('by_event', q => q.eq('eventId', id)).collect();
    const transactions = await ctx.db.query('transactions').withIndex('by_event', q => q.eq('eventId', id)).collect();
    for (const t of [...ticketTypes, ...coupons, ...lectures, ...transactions]) await ctx.db.delete(t._id);
    await ctx.db.delete(id);
  },
});

/** One-time: npx convex run events:backfillEventKeys (internal — run from Convex dashboard or CLI) */
export const backfillEventKeys = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('events').collect();
    let updated = 0;
    for (const ev of all) {
      if (ev.eventKey) continue;
      await ctx.db.patch(ev._id, { eventKey: await allocEventKey(ctx) });
      updated++;
    }
    return { updated };
  },
});
