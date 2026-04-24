import * as db from './db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ref(fn: (args: any) => any) {
  return { _fn: fn };
}

export const api = {
  events: {
    list:   ref(db.listEvents),
    get:    ref(db.getEvent),
    create: ref(db.createEvent),
    update: ref(db.updateEvent),
    remove: ref(db.removeEvent),
  },
  tickets: {
    listByEvent: ref(db.listTicketsByEvent),
    create:      ref(db.createTicket),
    update:      ref(db.updateTicket),
    remove:      ref(db.removeTicket),
  },
  coupons: {
    listByEvent: ref(db.listCouponsByEvent),
    create:      ref(db.createCoupon),
    update:      ref(db.updateCoupon),
    remove:      ref(db.removeCoupon),
  },
  transactions: {
    list:        ref(db.listTransactions),
    listByEvent: ref(db.listTransactionsByEvent),
  },
};
