export interface OrganizerEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  category: string;
  image?: string;
  description?: string;
}

export interface TicketType {
  id: string;
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

export interface Coupon {
  id: string;
  eventId: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  enabled: boolean;
}

export interface Lecture {
  id: string;
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

export interface SelectedLecture {
  slotKey: string;
  lectureId: string;
}

export interface Transaction {
  id: string;
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

export const mockEvents: OrganizerEvent[] = [
  {
    id: 'ev1',
    name: 'פסטיבל בריכת הסולטן – ליל הקיץ',
    date: '15 ביוני 2025',
    time: '19:00',
    venue: 'בריכת הסולטן, ירושלים',
    status: 'active',
    totalTickets: 3500,
    soldTickets: 2690,
    revenue: 887400,
    category: 'מוזיקה',
    description: 'ערב מוזיקלי מיוחד תחת כיפת השמיים בירושלים',
  },
  {
    id: 'ev2',
    name: 'ג\'אז בחצר – ירושלים',
    date: '22 ביולי 2025',
    time: '20:30',
    venue: 'מוזיאון ישראל, ירושלים',
    status: 'active',
    totalTickets: 800,
    soldTickets: 340,
    revenue: 89200,
    category: "ג'אז",
    description: 'ערב ג\'אז אינטימי בחצר מוזיאון ישראל',
  },
  {
    id: 'ev3',
    name: 'סיור לילה בעיר העתיקה',
    date: '10 אוגוסט 2025',
    time: '21:00',
    venue: 'שער יפו, ירושלים',
    status: 'draft',
    totalTickets: 200,
    soldTickets: 0,
    revenue: 0,
    category: 'סיורים',
    description: 'סיור קסום בלילה בלב ירושלים',
  },
  {
    id: 'ev4',
    name: 'ספורט אלקטרוני – טורניר פתוח',
    date: '5 ספטמבר 2025',
    time: '10:00',
    venue: 'מרכז בינת, ירושלים',
    status: 'paused',
    totalTickets: 500,
    soldTickets: 127,
    revenue: 12700,
    category: 'ספורט',
    description: 'טורניר גיימינג פתוח לכולם',
  },
];

export const mockTickets: TicketType[] = [
  { id: 't1', eventId: 'ev1', name: 'פלאטיניום VIP', price: 650, quantity: 60, sold: 57, enabled: true, minPerOrder: 1, maxPerOrder: 4, description: 'גישה VIP + מתנות' },
  { id: 't2', eventId: 'ev1', name: 'זהב – מרכז קדמי', price: 450, quantity: 144, sold: 130, enabled: true, minPerOrder: 1, maxPerOrder: 6 },
  { id: 't3', eventId: 'ev1', name: 'כסף – כנפיים', price: 280, quantity: 256, sold: 210, enabled: true, minPerOrder: 1, maxPerOrder: 8 },
  { id: 't4', eventId: 'ev1', name: 'ברונזה – אחורי', price: 150, quantity: 840, sold: 693, enabled: true, minPerOrder: 1, maxPerOrder: 10 },
  { id: 't5', eventId: 'ev2', name: 'כרטיס כניסה', price: 280, quantity: 600, sold: 290, enabled: true, minPerOrder: 1, maxPerOrder: 6 },
  { id: 't6', eventId: 'ev2', name: 'שולחן VIP (4 אנשים)', price: 1200, quantity: 50, sold: 25, enabled: true, minPerOrder: 1, maxPerOrder: 2 },
];

export const mockCoupons: Coupon[] = [
  { id: 'c1', eventId: 'ev1', code: 'EARLY20', type: 'percent', value: 20, usageLimit: 50, usedCount: 48, expiresAt: '2025-05-30', enabled: true },
  { id: 'c2', eventId: 'ev1', code: 'FRIEND50', type: 'fixed', value: 50, usageLimit: 100, usedCount: 23, enabled: true },
  { id: 'c3', eventId: 'ev2', code: 'JAZZ10', type: 'percent', value: 10, usageLimit: 30, usedCount: 11, enabled: false },
];

export const mockLectures: Lecture[] = [
  // Slot 1: 19:30–20:15
  { id: 'lec1', eventId: 'ev1', title: 'מפגש עם היוצר', speaker: 'דוד דרעי', location: 'אמפיתאטרון', startTime: '19:30', endTime: '20:15', maxCapacity: 200, registrations: 185, track: 'אמנים', description: 'שיחה פתוחה עם היוצר על דרכו האמנותית' },
  { id: 'lec2', eventId: 'ev1', title: 'שירה בציבור – ניגוני ירושלים', speaker: 'מרים אדלר', location: 'ירושלים הקטנה', startTime: '19:30', endTime: '20:15', maxCapacity: 150, registrations: 70, track: 'שירה', description: 'ניגונים ירושלמיים מסורתיים עם הזמרת מרים אדלר' },
  // Slot 2: 20:30–21:15
  { id: 'lec3', eventId: 'ev1', title: "ג'אז ים תיכוני – מפגש תרבויות", speaker: "קוורטט יהושע", location: 'ספריה הלאומית', startTime: '20:30', endTime: '21:15', maxCapacity: 300, registrations: 300, track: "ג'אז", description: "פיוז'ן ייחודי של ג'אז וצלילים מזרחיים" },
  { id: 'lec4', eventId: 'ev1', title: 'עוד ועכשיו – מוזיקת המזרח', speaker: 'חמוד ג\'לאסי', location: 'רחבה ב\'', startTime: '20:30', endTime: '21:15', maxCapacity: 250, registrations: 210, track: 'עולמי', description: 'הרצאה מעשית על כלי המוזיקה המזרחית' },
  { id: 'lec5', eventId: 'ev1', title: 'אתנומוסיקולוגיה ישראלית', speaker: 'פרופ\' יוסף כהן', location: 'בית עדה', startTime: '20:30', endTime: '21:15', maxCapacity: 120, registrations: 45, track: 'אקדמי', description: 'שורשי המוזיקה הישראלית – מחקר ועדות' },
  // Slot 3: 21:30–22:15
  { id: 'lec6', eventId: 'ev1', title: 'מסע אל הפסנתר', speaker: 'הגר יפה', location: 'אמפיתאטרון', startTime: '21:30', endTime: '22:15', maxCapacity: 200, registrations: 90, track: 'קלאסי', description: 'מופע פסנתר אינטימי עם סיפורים על כל יצירה' },
  { id: 'lec7', eventId: 'ev1', title: 'פינת הרוק הישראלי', speaker: 'שי בן צור', location: 'ירושלים הקטנה', startTime: '21:30', endTime: '22:15', maxCapacity: 180, registrations: 175, track: 'רוק', description: 'שיחה ונגינה – הרוק הישראלי מאז ועד היום' },
];

const names = ['דוד כהן', 'שרה לוי', 'משה מזרחי', 'רחל גולדברג', 'אברהם ביטון', 'מרים פרץ', 'יוסי אלוני', 'חנה שפירא', 'רון ברזילי', 'תמר כץ'];
const emails = ['david@gmail.com', 'sarah@walla.co.il', 'moshe@hotmail.com', 'rachel@yahoo.com', 'avraham@gmail.com', 'miriam@gmail.com', 'yossi@walla.co.il', 'hana@gmail.com', 'ron@hotmail.com', 'tamar@gmail.com'];

export const mockTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => {
  const nameIdx = i % names.length;
  const status = i === 3 ? 'refunded' : i === 7 ? 'failed' : i === 15 ? 'cancelled' : 'success';
  const qty = (i % 3) + 1;
  const price = [150, 280, 450][i % 3];
  const total = qty * price;
  const date = new Date(2025, 4, 1 + i);
  return {
    id: `tx${i + 1}`,
    eventId: 'ev1',
    buyerName: names[nameIdx],
    buyerEmail: emails[nameIdx],
    buyerPhone: `05${String(i).padStart(1, '0')}-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
    tickets: [{ typeName: ['ברונזה', 'כסף', 'זהב'][i % 3], quantity: qty, unitPrice: price }],
    total,
    fee: Math.round(total * 0.05),
    status,
    createdAt: date.toLocaleDateString('he-IL'),
    checkInStatus: status === 'success' && i < 10 ? 'checked-in' : 'pending',
    qrCode: `QR-EV1-TX${i + 1}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    coupon: i === 1 ? 'EARLY20' : i === 5 ? 'FRIEND50' : undefined,
  };
});
