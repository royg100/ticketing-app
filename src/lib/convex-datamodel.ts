import type { DBEvent, DBTicketType, DBCoupon, DBLecture, DBTransaction } from './db';

export type Id<_T extends string> = string;

type TableMap = {
  events: DBEvent;
  ticketTypes: DBTicketType;
  coupons: DBCoupon;
  lectures: DBLecture;
  transactions: DBTransaction;
};

export type Doc<T extends keyof TableMap> = TableMap[T];
