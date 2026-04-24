import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAction, useQuery, useMutation } from 'convex/react';
import { ArrowRight, CreditCard, Lock, User, Tag, CheckCircle, XCircle, BookOpen, ChevronLeft, Smartphone, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { mockCoupons, mockLectures } from '../data/organizer';
import LectureSelectionModal from '../components/LectureSelectionModal';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const SECTION_NAMES: Record<string, string> = {
  'vip-floor': 'VIP רצפה',
  'front-left': 'קדמי שמאל',
  'front-right': 'קדמי ימין',
  'left-wing': 'כנף שמאל',
  'right-wing': 'כנף ימין',
  center: 'מרכז',
  'back-left': 'אחורי שמאל',
  'back-right': 'אחורי ימין',
  rear: 'אחורי מרכז',
};

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const inputStyle = {
  width: '100%',
  background: '#faf8ff',
  border: '1.5px solid #ddd6fe',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#1a1a2e',
  outline: 'none',
  fontSize: '14px',
};

const BIT_PHONE = (import.meta.env.VITE_BIT_PHONE as string | undefined)?.trim() ?? '';
const BIT_PAYEE_NAME = (import.meta.env.VITE_BIT_PAYEE_NAME as string | undefined)?.trim() || 'העסק';

type PayMode = 'stripe' | 'bit';

/** תואם ל־`STRIPE_MIN_GRAND_TOTAL_ILS` ב-convex/stripeCheckout.ts */
const STRIPE_MIN_NIS = 2;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payMode, setPayMode] = useState<PayMode>('stripe');
  const createCheckout = useAction(api.stripeCheckout.createCheckoutSession);
  const createBitPending = useMutation(api.bitCheckout.createPending);
  const firstActive = useQuery(api.events.getFirstActiveId);
  const envEvent = import.meta.env.VITE_CHECKOUT_EVENT_ID as string | undefined;
  const eventId: Id<'events'> | undefined =
    (envEvent && envEvent.length > 0 ? (envEvent as Id<'events'>) : undefined) ?? firstActive?._id;
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const { selectedLectures, setSelectedLectures } = useCart();
  const [showLectureModal, setShowLectureModal] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponState, setCouponState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof mockCoupons[0] | null>(null);

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(total * appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, total)
    : 0;

  const serviceFee = Math.round((total - discount) * 0.05);
  const grandTotal = total - discount + serviceFee;

  const handleCouponApply = () => {
    const code = couponInput.trim().toUpperCase();
    const found = mockCoupons.find(
      c => c.code === code && c.enabled && c.usedCount < c.usageLimit &&
        (!c.expiresAt || new Date(c.expiresAt) >= new Date()),
    );
    if (found) {
      setAppliedCoupon(found);
      setCouponState('valid');
    } else {
      setAppliedCoupon(null);
      setCouponState('invalid');
    }
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    setCouponState('idle');
    setCouponInput('');
  };

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const buildTicketsForPayment = () =>
    items.map((it) => ({
      typeName: `${SECTION_NAMES[it.seat.section] || it.seat.section} · שורה ${it.seat.row} · מקום ${it.seat.number}`,
      quantity: 1,
      unitPrice: it.seat.price,
    }));

  const clearCancelQuery = () => {
    if (searchParams.get('cancel')) {
      setSearchParams((p) => {
        p.delete('cancel');
        return p;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      setPayError('אין אירוע פעיל ב-Convex. הפעלו seed, או הוסיפו VITE_CHECKOUT_EVENT_ID (מזהה אירוע מהלוח).');
      return;
    }
    if (payMode === 'bit') {
      if (!BIT_PHONE) {
        setPayError('תשלום בביט לא הוגדר: הוסיפו VITE_BIT_PHONE ל-.env.local ופרסימו/י שוב (מספר לקבלת ביט).');
        return;
      }
      setLoading(true);
      setPayError(null);
      try {
        const { transactionId, grandTotal: gt, qrCode } = await createBitPending({
          eventId,
          buyerName: `${form.firstName} ${form.lastName}`.trim(),
          buyerEmail: form.email.trim(),
          buyerPhone: form.phone.trim(),
          tickets: buildTicketsForPayment(),
          couponCode: appliedCoupon?.code,
        });
        setLoading(false);
        navigate('/confirmation?bit=1', {
          state: {
            method: 'bit' as const,
            transactionId: String(transactionId),
            qrCode,
            grandTotal: gt,
            payeePhone: BIT_PHONE,
            payeeName: BIT_PAYEE_NAME,
          },
        });
      } catch (err) {
        setLoading(false);
        setPayError(err instanceof Error ? err.message : 'לא ניתן לרשום הזמנה');
      }
      return;
    }

    if (grandTotal < STRIPE_MIN_NIS) {
      setPayError(
        `סליקה ב-Stripe אפשרית מ-₪${STRIPE_MIN_NIS} ומעלה (מגבלת Stripe). הוסיפו מושב, שינו מחיר, או בחרו תשלום בביט.`,
      );
      return;
    }

    setLoading(true);
    setPayError(null);
    try {
      const { url } = await createCheckout({
        eventId,
        buyerName: `${form.firstName} ${form.lastName}`.trim(),
        buyerEmail: form.email.trim(),
        buyerPhone: form.phone.trim(),
        tickets: buildTicketsForPayment(),
        couponCode: appliedCoupon?.code,
      });
      window.location.assign(url);
    } catch (err) {
      setLoading(false);
      setPayError(err instanceof Error ? err.message : 'לא ניתן לפתוח תשלום');
    }
  };

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: '#ede9fe' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors hover:opacity-70"
          style={{ color: '#7c3aed' }}
        >
          <ArrowRight size={16} />
          חזרה לבחירת מקומות
        </button>

        <h1 className="text-2xl font-black mb-8" style={{ color: '#1a1a2e' }}>השלמת הרכישה</h1>

        {searchParams.get('cancel') === '1' && (
          <div
            className="mb-6 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
          >
            <p className="text-sm" style={{ color: '#9a3412' }}>
              התשלום ב-Stripe בוטל. אפשר לנסות שוב או לחזור.
            </p>
            <button
              type="button"
              onClick={clearCancelQuery}
              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: '#ffedd5', color: '#9a3412' }}
            >
              סגור
            </button>
          </div>
        )}

        {payError && (
          <div className="mb-6 rounded-2xl px-4 py-3 text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            {payError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal info */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #ddd6fe' }}>
              <h2 className="font-black mb-5 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <User size={16} style={{ color: '#7c3aed' }} />
                פרטים אישיים
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { field: 'firstName', label: 'שם פרטי', placeholder: 'ישראל', type: 'text', dir: undefined },
                  { field: 'lastName', label: 'שם משפחה', placeholder: 'ישראלי', type: 'text', dir: undefined },
                  { field: 'email', label: 'אימייל', placeholder: 'name@email.com', type: 'email', dir: 'ltr' },
                  { field: 'phone', label: 'טלפון', placeholder: '050-0000000', type: 'tel', dir: 'ltr' },
                ] as const).map(({ field, label, placeholder, type, dir }) => (
                  <div key={field}>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>{label}</label>
                    <input
                      required
                      type={type ?? 'text'}
                      value={form[field as keyof FormState]}
                      onChange={handleChange(field as keyof FormState)}
                      style={inputStyle}
                      placeholder={placeholder}
                      dir={dir}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lecture selection */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #ddd6fe' }}>
              <div className="flex items-center justify-between">
                <h2 className="font-black flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                  <BookOpen size={16} style={{ color: '#7c3aed' }} />
                  הרצאות ומפגשים
                </h2>
                <button
                  type="button"
                  onClick={() => setShowLectureModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: '#ede9fe', color: '#7c3aed' }}
                >
                  {selectedLectures.length > 0 ? 'ערוך בחירה' : 'בחר הרצאות'}
                  <ChevronLeft size={13} />
                </button>
              </div>

              {selectedLectures.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedLectures.map(sel => {
                    const lec = mockLectures.find(l => l.id === sel.lectureId);
                    if (!lec) return null;
                    return (
                      <div key={sel.lectureId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                        <CheckCircle size={14} style={{ color: '#7c3aed' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#1a1a2e' }}>{lec.title}</p>
                          <p className="text-xs" style={{ color: '#9b8fb0' }}>{lec.startTime}–{lec.endTime} · {lec.location} · {lec.speaker}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-xs" style={{ color: '#9b8fb0' }}>
                  האירוע כולל הרצאות ומפגשים ייחודיים. בחירת ישיבה מראש מובטחת!
                </p>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #ddd6fe' }}>
              <h2 className="font-black mb-4 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <Tag size={16} style={{ color: '#7c3aed' }} />
                קוד קופון
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#dcfce7', border: '1.5px solid #86efac' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} style={{ color: '#15803d' }} />
                    <span className="font-bold text-sm" style={{ color: '#15803d' }}>
                      {appliedCoupon.code} —{' '}
                      {appliedCoupon.type === 'percent'
                        ? `${appliedCoupon.value}% הנחה`
                        : `₪${appliedCoupon.value} הנחה`}
                    </span>
                  </div>
                  <button onClick={handleCouponRemove} className="text-xs font-bold hover:opacity-70" style={{ color: '#15803d' }}>
                    הסר
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponState('idle'); }}
                      onKeyDown={e => e.key === 'Enter' && handleCouponApply()}
                      placeholder="הכנס קוד קופון"
                      style={{
                        ...inputStyle,
                        borderColor: couponState === 'invalid' ? '#fca5a5' : couponState === 'valid' ? '#86efac' : '#ddd6fe',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                      }}
                      dir="ltr"
                    />
                    {couponState === 'invalid' && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#b91c1c' }}>
                        <XCircle size={12} />
                        קוד לא תקין, פג תוקף, או הגיע למגבלת שימוש
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCouponApply}
                    disabled={!couponInput.trim()}
                    className="px-5 rounded-xl font-bold text-sm shrink-0 transition-all"
                    style={couponInput.trim()
                      ? { background: '#7c3aed', color: '#fff' }
                      : { background: '#f3f0ff', color: '#c4b5fd', cursor: 'not-allowed' }}
                  >
                    החל
                  </button>
                </div>
              )}
            </div>

            {/* אמצעי תשלום */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #ddd6fe' }}>
              <h2 className="font-black mb-4" style={{ color: '#1a1a2e' }}>איך לשלם</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPayMode('stripe')}
                  className="rounded-2xl p-4 text-right transition-all"
                  style={{
                    border: payMode === 'stripe' ? '2px solid #7c3aed' : '1.5px solid #ddd6fe',
                    background: payMode === 'stripe' ? '#f5f0ff' : 'white',
                  }}
                >
                  <div className="flex items-center gap-2 font-bold" style={{ color: '#1a1a2e' }}>
                    <CreditCard size={18} style={{ color: '#7c3aed' }} />
                    כרטיס (Stripe)
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#6b5a8a' }}>אשראי, Apple Pay — מעבר לדף מאובטח</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode('bit')}
                  className="rounded-2xl p-4 text-right transition-all"
                  style={{
                    border: payMode === 'bit' ? '2px solid #00a859' : '1.5px solid #ddd6fe',
                    background: payMode === 'bit' ? '#ecfdf3' : 'white',
                  }}
                >
                  <div className="flex items-center gap-2 font-bold" style={{ color: '#1a1a2e' }}>
                    <Smartphone size={18} style={{ color: '#00a859' }} />
                    ביט (בנתיים)
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#6b5a8a' }}>העברה ידנית — ללא API בנק, לאישור ידני</p>
                </button>
              </div>

              {payMode === 'stripe' && (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed flex items-start gap-2" style={{ color: '#6b5a8a' }}>
                    <Lock size={14} className="shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
                    לאסוף מספר כרטיס — רק ב-Stripe. ביטול/חיוב — לפי מדיניות המארגן.
                  </p>
                  {grandTotal < STRIPE_MIN_NIS && (
                    <p
                      className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
                      style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
                    >
                      <strong>מינימום לסליקה ב-Stripe: ₪{STRIPE_MIN_NIS}</strong> (מגבלת Stripe; ₪1 לא עובר).
                      בחרו <strong>ביט</strong> להזמנה נמוכה, או הוסיפו מושב / שינו מחיר.
                    </p>
                  )}
                </div>
              )}

              {payMode === 'bit' && (
                <div className="space-y-3 text-sm" style={{ color: '#1a1a2e' }}>
                  <p className="flex items-start gap-2">
                    <HelpCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#00a859' }} />
                    <span>
                      <strong>תשלום בביט בנתיים:</strong> אחרי שליחת הטופס יופיעו הוראות, וההזמנה תירשם כ"ממתינה לאישור"
                      (לא מעדכנים מכירות אוטומטית — המארגן מוודא בביט/במערכת).
                    </span>
                  </p>
                  {BIT_PHONE ? (
                    <ul className="list-disc list-inside space-y-1.5 pr-1 text-right" style={{ color: '#4a3f66' }}>
                      <li>שלח/י <strong>₪{grandTotal.toLocaleString()}</strong> בביט למספר: <strong dir="ltr">{BIT_PAYEE_NAME}</strong> / <strong dir="ltr">{BIT_PHONE}</strong></li>
                      <li>אם בביט מבקשים "למה" או "הודעה" — הדבק/י את קוד האסמכתה שיופיע בדף אחרי הרישום</li>
                    </ul>
                  ) : (
                    <p className="rounded-xl px-3 py-2 text-xs" style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412' }}>
                      <strong>לא הוגדר מספר ביט באתר.</strong> הוסיפו <code className="font-mono">VITE_BIT_PHONE=05...</code> ו־
                      <code className="font-mono pr-1">VITE_BIT_PAYEE_NAME=שם</code> בקובץ <code>.env.local</code> והפעילו dev מחדש.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading
                || !eventId
                || (firstActive === undefined && !envEvent)
                || (payMode === 'bit' && !BIT_PHONE)
                || (payMode === 'stripe' && grandTotal < STRIPE_MIN_NIS)
              }
              className="w-full font-black py-4 rounded-full transition-all text-lg flex items-center justify-center gap-3"
              style={
                loading
                || !eventId
                || (firstActive === undefined && !envEvent)
                || (payMode === 'bit' && !BIT_PHONE)
                || (payMode === 'stripe' && grandTotal < STRIPE_MIN_NIS)
                  ? { background: '#ddd6fe', color: '#9b8fb0', cursor: 'not-allowed' }
                  : payMode === 'bit'
                    ? { background: '#00c851', color: '#fff' }
                    : { background: '#ffd433', color: '#1a1a2e' }
              }
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  {payMode === 'bit' ? 'רושמים…' : 'מכין מעבר לתשלום...'}
                </>
              ) : (firstActive === undefined && !envEvent) ? (
                <>
                  <Lock size={18} />
                  טוען אירוע…
                </>
              ) : !eventId ? (
                <>
                  <Lock size={18} />
                  אין אירוע לקישור
                </>
              ) : payMode === 'bit' && !BIT_PHONE ? (
                <>הגדיר/י VITE_BIT_PHONE</>
              ) : payMode === 'stripe' && grandTotal < STRIPE_MIN_NIS ? (
                <>מינימום Stripe ₪{STRIPE_MIN_NIS} — או ביט</>
              ) : payMode === 'bit' ? (
                <>רישום הזמנה (ביט) — ₪{grandTotal.toLocaleString()}</>
              ) : (
                <>
                  <Lock size={18} />
                  {discount > 0 ? (
                    <>המשך לתשלום ₪{grandTotal.toLocaleString()}{' '}
                      <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85em' }}>
                        ₪{(total + Math.round(total * 0.05)).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>המשך לתשלום ב-Stripe – ₪{grandTotal.toLocaleString()}</>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
              <h2 className="font-black mb-4" style={{ color: '#1a1a2e' }}>סיכום הזמנה</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.seat.id}
                    className="flex justify-between items-start text-sm pb-3"
                    style={{ borderBottom: '1px solid #f3f0ff' }}
                  >
                    <div>
                      <p className="font-bold" style={{ color: '#1a1a2e' }}>{item.event.titleHe}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{item.event.time} · {item.event.date}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>
                        {SECTION_NAMES[item.seat.section] || item.seat.section} · שורה {item.seat.row} · מקום {item.seat.number}
                      </p>
                    </div>
                    <span className="font-black shrink-0 mr-3" style={{ color: '#1a1a2e' }}>₪{item.seat.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 space-y-2 text-sm" style={{ borderTop: '1px solid #ddd6fe' }}>
                <div className="flex justify-between" style={{ color: '#6b5a8a' }}>
                  <span>סכום ביניים</span>
                  <span>₪{total.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-semibold" style={{ color: '#15803d' }}>
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      הנחת קופון ({appliedCoupon?.code})
                    </span>
                    <span>−₪{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: '#6b5a8a' }}>
                  <span>עמלת שירות (5%)</span>
                  <span>₪{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2" style={{ borderTop: '1px solid #ddd6fe', color: '#1a1a2e', paddingTop: '8px', marginTop: '8px' }}>
                  <span>סה"כ</span>
                  <span>₪{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedLectures.length > 0 && (
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
                <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#6b5a8a' }}>
                  <BookOpen size={12} style={{ color: '#7c3aed' }} />
                  הרצאות שנבחרו
                </p>
                <div className="space-y-1.5">
                  {selectedLectures.map(sel => {
                    const lec = mockLectures.find(l => l.id === sel.lectureId);
                    if (!lec) return null;
                    return (
                      <p key={sel.lectureId} className="text-xs" style={{ color: '#9b8fb0' }}>
                        {lec.startTime} · {lec.title}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 text-sm space-y-2" style={{ border: '1px solid #ddd6fe', color: '#6b5a8a' }}>
              <p className="flex items-center gap-2">
                <Lock size={13} style={{ color: '#7c3aed' }} />
                תשלום מאובטח ומוצפן
              </p>
              <p>הכרטיסים יישלחו לאימייל שהזנת לאחר אישור התשלום</p>
            </div>
          </div>
        </div>
      </div>
      {showLectureModal && (
        <LectureSelectionModal
          eventId="ev1"
          initialSelections={selectedLectures}
          onConfirm={setSelectedLectures}
          onClose={() => setShowLectureModal(false)}
        />
      )}
    </div>
  );
}
