import { mutation } from './_generated/server';

const INITIAL_EVENTS = [
  {
    name: 'פסטיבל בריכת הסולטן – ליל הקיץ',
    date: '15 ביוני 2025',
    time: '19:00',
    venue: 'בריכת הסולטן, ירושלים',
    status: 'active' as const,
    totalTickets: 3500,
    soldTickets: 2690,
    revenue: 887400,
    category: 'מוזיקה',
    description: 'ערב מוזיקלי מיוחד תחת כיפת השמיים בירושלים',
  },
  {
    name: "ג'אז בחצר – ירושלים",
    date: '22 ביולי 2025',
    time: '20:30',
    venue: 'מוזיאון ישראל, ירושלים',
    status: 'active' as const,
    totalTickets: 800,
    soldTickets: 340,
    revenue: 89200,
    category: "ג'אז",
    description: "ערב ג'אז אינטימי בחצר מוזיאון ישראל",
  },
  {
    name: 'סיור לילה בעיר העתיקה',
    date: '10 אוגוסט 2025',
    time: '21:00',
    venue: 'שער יפו, ירושלים',
    status: 'draft' as const,
    totalTickets: 200,
    soldTickets: 0,
    revenue: 0,
    category: 'סיורים',
    description: 'סיור קסום בלילה בלב ירושלים',
  },
  {
    name: 'ספורט אלקטרוני – טורניר פתוח',
    date: '5 ספטמבר 2025',
    time: '10:00',
    venue: 'מרכז בינת, ירושלים',
    status: 'paused' as const,
    totalTickets: 500,
    soldTickets: 127,
    revenue: 12700,
    category: 'ספורט',
    description: 'טורניר גיימינג פתוח לכולם',
  },
];

const TICKETS_BY_EVENT_IDX: Record<number, Array<{ name: string; price: number; quantity: number; sold: number; description?: string; minPerOrder: number; maxPerOrder: number }>> = {
  0: [
    { name: 'פלאטיניום VIP', price: 650, quantity: 60, sold: 57, description: 'גישה VIP + מתנות', minPerOrder: 1, maxPerOrder: 4 },
    { name: 'זהב – מרכז קדמי', price: 450, quantity: 144, sold: 130, minPerOrder: 1, maxPerOrder: 6 },
    { name: 'כסף – כנפיים', price: 280, quantity: 256, sold: 210, minPerOrder: 1, maxPerOrder: 8 },
    { name: 'ברונזה – אחורי', price: 150, quantity: 840, sold: 693, minPerOrder: 1, maxPerOrder: 10 },
  ],
  1: [
    { name: 'כרטיס כניסה', price: 280, quantity: 600, sold: 290, minPerOrder: 1, maxPerOrder: 6 },
    { name: 'שולחן VIP (4 אנשים)', price: 1200, quantity: 50, sold: 25, minPerOrder: 1, maxPerOrder: 2 },
  ],
};

const COUPONS_BY_EVENT_IDX: Record<number, Array<{ code: string; type: 'percent' | 'fixed'; value: number; usageLimit: number; usedCount: number; expiresAt?: string; enabled: boolean }>> = {
  0: [
    { code: 'EARLY20', type: 'percent', value: 20, usageLimit: 50, usedCount: 48, expiresAt: '2025-05-30', enabled: true },
    { code: 'FRIEND50', type: 'fixed', value: 50, usageLimit: 100, usedCount: 23, enabled: true },
  ],
  1: [
    { code: 'JAZZ10', type: 'percent', value: 10, usageLimit: 30, usedCount: 11, enabled: false },
  ],
};

const LECTURES_EVENT_IDX_0 = [
  { title: 'מפגש עם היוצר', speaker: 'דוד דרעי', location: 'אמפיתאטרון', startTime: '19:30', endTime: '20:15', maxCapacity: 200, registrations: 185, track: 'אמנים', description: 'שיחה פתוחה עם היוצר על דרכו האמנותית' },
  { title: 'שירה בציבור – ניגוני ירושלים', speaker: 'מרים אדלר', location: 'ירושלים הקטנה', startTime: '19:30', endTime: '20:15', maxCapacity: 150, registrations: 70, track: 'שירה', description: 'ניגונים ירושלמיים מסורתיים עם הזמרת מרים אדלר' },
  { title: "ג'אז ים תיכוני – מפגש תרבויות", speaker: 'קוורטט יהושע', location: 'ספריה הלאומית', startTime: '20:30', endTime: '21:15', maxCapacity: 300, registrations: 300, track: "ג'אז", description: "פיוז'ן ייחודי של ג'אז וצלילים מזרחיים" },
  { title: 'עוד ועכשיו – מוזיקת המזרח', speaker: "חמוד ג'לאסי", location: "רחבה ב'", startTime: '20:30', endTime: '21:15', maxCapacity: 250, registrations: 210, track: 'עולמי', description: 'הרצאה מעשית על כלי המוזיקה המזרחית' },
  { title: 'אתנומוסיקולוגיה ישראלית', speaker: "פרופ' יוסף כהן", location: 'בית עדה', startTime: '20:30', endTime: '21:15', maxCapacity: 120, registrations: 45, track: 'אקדמי', description: 'שורשי המוזיקה הישראלית – מחקר ועדות' },
  { title: 'מסע אל הפסנתר', speaker: 'הגר יפה', location: 'אמפיתאטרון', startTime: '21:30', endTime: '22:15', maxCapacity: 200, registrations: 90, track: 'קלאסי', description: 'מופע פסנתר אינטימי עם סיפורים על כל יצירה' },
  { title: 'פינת הרוק הישראלי', speaker: 'שי בן צור', location: 'ירושלים הקטנה', startTime: '21:30', endTime: '22:15', maxCapacity: 180, registrations: 175, track: 'רוק', description: 'שיחה ונגינה – הרוק הישראלי מאז ועד היום' },
];

const NAMES = ['דוד כהן', 'שרה לוי', 'משה מזרחי', 'רחל גולדברג', 'אברהם ביטון', 'מרים פרץ', 'יוסי אלוני', 'חנה שפירא', 'רון ברזילי', 'תמר כץ'];
const EMAILS = ['david@gmail.com', 'sarah@walla.co.il', 'moshe@hotmail.com', 'rachel@yahoo.com', 'avraham@gmail.com', 'miriam@gmail.com', 'yossi@walla.co.il', 'hana@gmail.com', 'ron@hotmail.com', 'tamar@gmail.com'];

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('events').first();
    if (existing) {
      return { skipped: true, message: 'מסד הנתונים כבר מכיל נתונים. דילוג.' };
    }

    const eventIds = [];
    for (const ev of INITIAL_EVENTS) {
      const id = await ctx.db.insert('events', ev);
      eventIds.push(id);
    }

    let ticketCount = 0;
    for (const [idxStr, tickets] of Object.entries(TICKETS_BY_EVENT_IDX)) {
      const idx = Number(idxStr);
      for (const t of tickets) {
        await ctx.db.insert('ticketTypes', { ...t, eventId: eventIds[idx], enabled: true });
        ticketCount++;
      }
    }

    let couponCount = 0;
    for (const [idxStr, coupons] of Object.entries(COUPONS_BY_EVENT_IDX)) {
      const idx = Number(idxStr);
      for (const c of coupons) {
        await ctx.db.insert('coupons', { ...c, eventId: eventIds[idx] });
        couponCount++;
      }
    }

    for (const lec of LECTURES_EVENT_IDX_0) {
      await ctx.db.insert('lectures', { ...lec, eventId: eventIds[0] });
    }

    let txCount = 0;
    for (let i = 0; i < 30; i++) {
      const nameIdx = i % NAMES.length;
      const status = i === 3 ? 'refunded' : i === 7 ? 'failed' : i === 15 ? 'cancelled' : 'success';
      const qty = (i % 3) + 1;
      const price = [150, 280, 450][i % 3];
      const total = qty * price;
      const date = new Date(2025, 4, 1 + i);
      await ctx.db.insert('transactions', {
        eventId: eventIds[0],
        buyerName: NAMES[nameIdx],
        buyerEmail: EMAILS[nameIdx],
        buyerPhone: `05${String(i).padStart(1, '0')}-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
        tickets: [{ typeName: ['ברונזה', 'כסף', 'זהב'][i % 3], quantity: qty, unitPrice: price }],
        total,
        fee: Math.round(total * 0.05),
        status: status as 'success' | 'failed' | 'cancelled' | 'refunded',
        createdAt: date.toLocaleDateString('he-IL'),
        checkInStatus: status === 'success' && i < 10 ? 'checked-in' : 'pending',
        qrCode: `QR-EV1-TX${i + 1}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        coupon: i === 1 ? 'EARLY20' : i === 5 ? 'FRIEND50' : undefined,
      });
      txCount++;
    }

    return {
      skipped: false,
      events: eventIds.length,
      tickets: ticketCount,
      coupons: couponCount,
      lectures: LECTURES_EVENT_IDX_0.length,
      transactions: txCount,
    };
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of ['transactions', 'lectures', 'coupons', 'ticketTypes', 'events'] as const) {
      const rows = await ctx.db.query(table).collect();
      for (const r of rows) await ctx.db.delete(r._id);
    }
    return { cleared: true };
  },
});
