import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Lock, User, Tag, CheckCircle, XCircle, BookOpen, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { mockCoupons, mockLectures } from '../data/organizer';
import LectureSelectionModal from '../components/LectureSelectionModal';

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
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
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

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
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
    let val = e.target.value;
    if (field === 'cardNumber') {
      val = val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (field === 'cardExpiry') {
      val = val.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    }
    if (field === 'cardCvv') val = val.replace(/\D/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    clearCart();
    navigate('/confirmation');
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

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #ddd6fe' }}>
              <h2 className="font-black mb-5 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <CreditCard size={16} style={{ color: '#7c3aed' }} />
                פרטי תשלום
                <span className="flex items-center gap-1 mr-auto text-xs font-normal" style={{ color: '#9b8fb0' }}>
                  <Lock size={12} />
                  מאובטח SSL
                </span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>מספר כרטיס</label>
                  <input
                    required
                    value={form.cardNumber}
                    onChange={handleChange('cardNumber')}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                    placeholder="0000 0000 0000 0000"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שם בעל הכרטיס</label>
                  <input
                    required
                    value={form.cardName}
                    onChange={handleChange('cardName')}
                    style={inputStyle}
                    placeholder="ISRAEL ISRAELI"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>תוקף</label>
                    <input
                      required
                      value={form.cardExpiry}
                      onChange={handleChange('cardExpiry')}
                      style={{ ...inputStyle, fontFamily: 'monospace' }}
                      placeholder="MM/YY"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>CVV</label>
                    <input
                      required
                      value={form.cardCvv}
                      onChange={handleChange('cardCvv')}
                      style={{ ...inputStyle, fontFamily: 'monospace' }}
                      placeholder="000"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-black py-4 rounded-full transition-all text-lg flex items-center justify-center gap-3"
              style={loading
                ? { background: '#ddd6fe', color: '#9b8fb0', cursor: 'not-allowed' }
                : { background: '#ffd433', color: '#1a1a2e' }
              }
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  מעבד תשלום...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  {discount > 0 ? (
                    <>שלם ₪{grandTotal.toLocaleString()} <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85em' }}>₪{(total + Math.round(total * 0.05)).toLocaleString()}</span></>
                  ) : (
                    <>שלם ₪{grandTotal.toLocaleString()}</>
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
