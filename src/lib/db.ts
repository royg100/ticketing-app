// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBEvent {
  _id: string;
  _creationTime: number;
  name: string;
  date: string;
  time: string;
  venue: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  category: string;
  description?: string;
  image?: string;
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  seoTitle?: string;
  seoDesc?: string;
  fbPixel?: string;
  gaId?: string;
  cancelPolicy?: string;
}

export interface DBTicketType {
  _id: string;
  _creationTime: number;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  enabled: boolean;
  saleStart?: string;
  saleEnd?: string;
  minPerOrder: number;
  maxPerOrder: number;
}

export interface DBCoupon {
  _id: string;
  _creationTime: number;
  eventId: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  enabled: boolean;
}

export interface DBLecture {
  _id: string;
  _creationTime: number;
  eventId: string;
  title: string;
  speaker: string;
  location: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  registrations: number;
  description?: string;
  track?: string;
}

export interface DBTransaction {
  _id: string;
  _creationTime: number;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  tickets: { typeName: string; quantity: number; unitPrice: number }[];
  total: number;
  fee: number;
  status: 'success' | 'failed' | 'cancelled' | 'refunded';
  createdAt: string;
  coupon?: string;
  checkInStatus: 'pending' | 'checked-in';
  qrCode: string;
}

interface TickDB {
  events: DBEvent[];
  ticketTypes: DBTicketType[];
  coupons: DBCoupon[];
  lectures: DBLecture[];
  transactions: DBTransaction[];
  seeded: boolean;
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'tick_db_v1';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now(): number {
  return Date.now();
}

function load(): TickDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TickDB;
  } catch { /* ignore */ }
  const db = seed();
  save(db);
  return db;
}

function save(db: TickDB): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── Seed data ─────────────────────────────────────────────────────────────────

function seed(): TickDB {
  const ev1 = genId(), ev2 = genId(), ev3 = genId(), ev4 = genId();

  const names = ['דוד כהן', 'שרה לוי', 'משה מזרחי', 'רחל גולדברג', 'אברהם ביטון', 'מרים פרץ', 'יוסי אלוני', 'חנה שפירא', 'רון ברזילי', 'תמר כץ'];
  const emails = ['david@gmail.com', 'sarah@walla.co.il', 'moshe@hotmail.com', 'rachel@yahoo.com', 'avraham@gmail.com', 'miriam@gmail.com', 'yossi@walla.co.il', 'hana@gmail.com', 'ron@hotmail.com', 'tamar@gmail.com'];

  const transactions: DBTransaction[] = Array.from({ length: 30 }, (_, i) => {
    const ni = i % names.length;
    const st: DBTransaction['status'] = i === 3 ? 'refunded' : i === 7 ? 'failed' : i === 15 ? 'cancelled' : 'success';
    const qty = (i % 3) + 1;
    const price = [150, 280, 450][i % 3];
    const total = qty * price;
    const date = new Date(2025, 4, 1 + i);
    return {
      _id: genId(),
      _creationTime: now() - (30 - i) * 86400000,
      eventId: ev1,
      buyerName: names[ni],
      buyerEmail: emails[ni],
      buyerPhone: `05${i % 2 === 0 ? '2' : '4'}-${(Math.floor(Math.random() * 9000000) + 1000000)}`,
      tickets: [{ typeName: ['ברונזה', 'כסף', 'זהב'][i % 3], quantity: qty, unitPrice: price }],
      total,
      fee: Math.round(total * 0.05),
      status: st,
      createdAt: date.toLocaleDateString('he-IL'),
      checkInStatus: st === 'success' && i < 10 ? 'checked-in' : 'pending',
      qrCode: `QR-EV1-TX${i + 1}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      coupon: i === 1 ? 'EARLY20' : i === 5 ? 'FRIEND50' : undefined,
    };
  });

  return {
    seeded: true,
    events: [
      { _id: ev1, _creationTime: now() - 5000, name: 'פסטיבל בריכת הסולטן – ליל הקיץ', date: '15 ביוני 2025', time: '19:00', venue: 'בריכת הסולטן, ירושלים', status: 'active', totalTickets: 3500, soldTickets: 2690, revenue: 887400, category: 'מוזיקה', description: 'ערב מוזיקלי מיוחד תחת כיפת השמיים בירושלים', cancelPolicy: 'לא ניתן לבטל עסקה לאחר הרכישה' },
      { _id: ev2, _creationTime: now() - 4000, name: "ג'אז בחצר – ירושלים", date: '22 ביולי 2025', time: '20:30', venue: 'מוזיאון ישראל, ירושלים', status: 'active', totalTickets: 800, soldTickets: 340, revenue: 89200, category: "ג'אז", description: "ערב ג'אז אינטימי בחצר מוזיאון ישראל" },
      { _id: ev3, _creationTime: now() - 3000, name: 'סיור לילה בעיר העתיקה', date: '10 אוגוסט 2025', time: '21:00', venue: 'שער יפו, ירושלים', status: 'draft', totalTickets: 200, soldTickets: 0, revenue: 0, category: 'סיורים', description: 'סיור קסום בלילה בלב ירושלים' },
      { _id: ev4, _creationTime: now() - 2000, name: 'ספורט אלקטרוני – טורניר פתוח', date: '5 ספטמבר 2025', time: '10:00', venue: 'מרכז בינת, ירושלים', status: 'paused', totalTickets: 500, soldTickets: 127, revenue: 12700, category: 'ספורט', description: 'טורניר גיימינג פתוח לכולם' },
    ],
    ticketTypes: [
      { _id: genId(), _creationTime: now(), eventId: ev1, name: 'פלאטיניום VIP', price: 650, quantity: 60, sold: 57, enabled: true, minPerOrder: 1, maxPerOrder: 4, description: 'גישה VIP + מתנות' },
      { _id: genId(), _creationTime: now(), eventId: ev1, name: 'זהב – מרכז קדמי', price: 450, quantity: 144, sold: 130, enabled: true, minPerOrder: 1, maxPerOrder: 6 },
      { _id: genId(), _creationTime: now(), eventId: ev1, name: 'כסף – כנפיים', price: 280, quantity: 256, sold: 210, enabled: true, minPerOrder: 1, maxPerOrder: 8 },
      { _id: genId(), _creationTime: now(), eventId: ev1, name: 'ברונזה – אחורי', price: 150, quantity: 840, sold: 693, enabled: true, minPerOrder: 1, maxPerOrder: 10 },
      { _id: genId(), _creationTime: now(), eventId: ev2, name: 'כרטיס כניסה', price: 280, quantity: 600, sold: 290, enabled: true, minPerOrder: 1, maxPerOrder: 6 },
      { _id: genId(), _creationTime: now(), eventId: ev2, name: 'שולחן VIP (4 אנשים)', price: 1200, quantity: 50, sold: 25, enabled: true, minPerOrder: 1, maxPerOrder: 2 },
    ],
    coupons: [
      { _id: genId(), _creationTime: now(), eventId: ev1, code: 'EARLY20', type: 'percent', value: 20, usageLimit: 50, usedCount: 48, expiresAt: '2025-05-30', enabled: true },
      { _id: genId(), _creationTime: now(), eventId: ev1, code: 'FRIEND50', type: 'fixed', value: 50, usageLimit: 100, usedCount: 23, enabled: true },
      { _id: genId(), _creationTime: now(), eventId: ev2, code: 'JAZZ10', type: 'percent', value: 10, usageLimit: 30, usedCount: 11, enabled: false },
    ],
    lectures: [
      { _id: genId(), _creationTime: now(), eventId: ev1, title: 'מפגש עם היוצר', speaker: 'דוד דרעי', location: 'אמפיתאטרון', startTime: '19:30', endTime: '20:15', maxCapacity: 200, registrations: 185, track: 'אמנים', description: 'שיחה פתוחה עם היוצר על דרכו האמנותית' },
      { _id: genId(), _creationTime: now(), eventId: ev1, title: 'שירה בציבור – ניגוני ירושלים', speaker: 'מרים אדלר', location: 'ירושלים הקטנה', startTime: '19:30', endTime: '20:15', maxCapacity: 150, registrations: 70, track: 'שירה' },
      { _id: genId(), _creationTime: now(), eventId: ev1, title: "ג'אז ים תיכוני", speaker: 'קוורטט יהושע', location: 'ספריה הלאומית', startTime: '20:30', endTime: '21:15', maxCapacity: 300, registrations: 300, track: "ג'אז" },
    ],
    transactions,
  };
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function listEvents(_args?: Record<string, never>): DBEvent[] {
  return load().events;
}

export function getEvent({ id }: { id: string }): DBEvent | null {
  return load().events.find(e => e._id === id) ?? null;
}

export function createEvent(args: {
  name: string; date: string; time: string; venue: string;
  category: string; description?: string; status: DBEvent['status'];
  totalTickets?: number; seoTitle?: string; seoDesc?: string;
  fbPixel?: string; gaId?: string; cancelPolicy?: string; image?: string;
}): string {
  const db = load();
  const id = genId();
  db.events.push({ _id: id, _creationTime: now(), soldTickets: 0, revenue: 0, totalTickets: 0, ...args });
  save(db);
  return id;
}

export function updateEvent({ id, ...patch }: { id: string } & Partial<DBEvent>): void {
  const db = load();
  const idx = db.events.findIndex(e => e._id === id);
  if (idx >= 0) { db.events[idx] = { ...db.events[idx], ...patch }; save(db); }
}

export function removeEvent({ id }: { id: string }): void {
  const db = load();
  db.events = db.events.filter(e => e._id !== id);
  db.ticketTypes = db.ticketTypes.filter(t => t.eventId !== id);
  db.coupons = db.coupons.filter(c => c.eventId !== id);
  db.lectures = db.lectures.filter(l => l.eventId !== id);
  db.transactions = db.transactions.filter(tx => tx.eventId !== id);
  save(db);
}

// ─── TicketTypes ──────────────────────────────────────────────────────────────

export function listTicketsByEvent({ eventId }: { eventId: string }): DBTicketType[] {
  return load().ticketTypes.filter(t => t.eventId === eventId);
}

export function createTicket(args: Omit<DBTicketType, '_id' | '_creationTime' | 'sold'>): string {
  const db = load();
  const id = genId();
  db.ticketTypes.push({ _id: id, _creationTime: now(), sold: 0, ...args });
  save(db);
  return id;
}

export function updateTicket({ id, ...patch }: { id: string } & Partial<DBTicketType>): void {
  const db = load();
  const idx = db.ticketTypes.findIndex(t => t._id === id);
  if (idx >= 0) { db.ticketTypes[idx] = { ...db.ticketTypes[idx], ...patch }; save(db); }
}

export function removeTicket({ id }: { id: string }): void {
  const db = load();
  db.ticketTypes = db.ticketTypes.filter(t => t._id !== id);
  save(db);
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export function listCouponsByEvent({ eventId }: { eventId: string }): DBCoupon[] {
  return load().coupons.filter(c => c.eventId === eventId);
}

export function createCoupon(args: Omit<DBCoupon, '_id' | '_creationTime' | 'usedCount'>): string {
  const db = load();
  const id = genId();
  db.coupons.push({ _id: id, _creationTime: now(), usedCount: 0, ...args });
  save(db);
  return id;
}

export function updateCoupon({ id, ...patch }: { id: string } & Partial<DBCoupon>): void {
  const db = load();
  const idx = db.coupons.findIndex(c => c._id === id);
  if (idx >= 0) { db.coupons[idx] = { ...db.coupons[idx], ...patch }; save(db); }
}

export function removeCoupon({ id }: { id: string }): void {
  const db = load();
  db.coupons = db.coupons.filter(c => c._id !== id);
  save(db);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function listTransactions(_args?: Record<string, never>): DBTransaction[] {
  return load().transactions;
}

export function listTransactionsByEvent({ eventId }: { eventId: string }): DBTransaction[] {
  return load().transactions.filter(tx => tx.eventId === eventId);
}
