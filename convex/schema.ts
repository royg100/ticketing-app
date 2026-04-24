import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  events: defineTable({
    /** Stable public id for queries, deep links, integrations (in addition to Convex _id) */
    eventKey: v.optional(v.string()),
    name: v.string(),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('paused'),
      v.literal('archived'),
    ),
    category: v.string(),
    /** Same value for all events in a "series" — buyer side nav groups by this, then category. */
    menuGroup: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    totalTickets: v.number(),
    soldTickets: v.number(),
    revenue: v.number(),
    seoTitle: v.optional(v.string()),
    seoDesc: v.optional(v.string()),
    fbPixel: v.optional(v.string()),
    gaId: v.optional(v.string()),
    cancelPolicy: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_eventKey', ['eventKey']),

  ticketTypes: defineTable({
    eventId: v.id('events'),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    sold: v.number(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    saleStart: v.optional(v.string()),
    saleEnd: v.optional(v.string()),
    minPerOrder: v.number(),
    maxPerOrder: v.number(),
  }).index('by_event', ['eventId']),

  coupons: defineTable({
    eventId: v.id('events'),
    code: v.string(),
    type: v.union(v.literal('percent'), v.literal('fixed')),
    value: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    expiresAt: v.optional(v.string()),
    enabled: v.boolean(),
  })
    .index('by_event', ['eventId'])
    .index('by_code', ['code']),

  lectures: defineTable({
    eventId: v.id('events'),
    title: v.string(),
    speaker: v.string(),
    location: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    maxCapacity: v.number(),
    registrations: v.number(),
    description: v.optional(v.string()),
    track: v.optional(v.string()),
  }).index('by_event', ['eventId']),

  transactions: defineTable({
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
    total: v.number(),
    fee: v.number(),
    status: v.union(
      v.literal('success'),
      v.literal('failed'),
      v.literal('cancelled'),
      v.literal('refunded'),
      /** תשלום בביט: מחכה לאישור ידני במארגנים; לא מעדכנים sold/revenue */
      v.literal('pending_bit'),
    ),
    createdAt: v.string(),
    coupon: v.optional(v.string()),
    checkInStatus: v.union(v.literal('pending'), v.literal('checked-in')),
    qrCode: v.string(),
    /** Stripe — למניעת כפל רישום מ-webhook; נשלח אחרי סליקה ב-Stripe */
    stripeSessionId: v.optional(v.string()),
  })
    .index('by_event', ['eventId'])
    .index('by_status', ['status'])
    .index('by_qr', ['qrCode'])
    .index('by_stripe_session', ['stripeSessionId']),

  /**
   * טיוטת תשלום: נשמרת בשרת לפני מעבר ל-Stripe, ואומתה ב-webhook
   * מול `session.amount_total` (הסכום האמיתי שחויב).
   */
  checkoutDrafts: defineTable({
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
    createdAt: v.string(),
    status: v.union(v.literal('pending'), v.literal('consumed')),
  }).index('by_status', ['status']),
});
