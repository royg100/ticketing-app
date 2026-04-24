import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Ticket, Tag, ToggleLeft, ToggleRight, Trash2,
  Edit3, ArrowRight, Percent, DollarSign, Calendar, X, Save,
} from 'lucide-react';
import { mockTickets, mockCoupons, mockEvents, type TicketType, type Coupon } from '../../data/organizer';

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#faf8ff',
  border: '1.5px solid #ddd6fe',
  borderRadius: '12px',
  padding: '10px 14px',
  color: '#1a1a2e',
  outline: 'none',
  fontSize: '14px',
};

function TicketCard({ ticket, onToggle }: { ticket: TicketType; onToggle: (id: string) => void }) {
  const soldPct = Math.round((ticket.sold / ticket.quantity) * 100);
  const remaining = ticket.quantity - ticket.sold;
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${ticket.enabled ? '#ddd6fe' : '#f1f5f9'}`, opacity: ticket.enabled ? 1 : 0.65 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-sm" style={{ color: '#1a1a2e' }}>{ticket.name}</h3>
            {remaining < 10 && remaining > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#fee2e2', color: '#b91c1c' }}>נותרו {remaining}!</span>
            )}
            {remaining === 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>אזל</span>
            )}
          </div>
          {ticket.description && <p className="text-xs mb-2" style={{ color: '#9b8fb0' }}>{ticket.description}</p>}

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg px-3 py-2 text-center" style={{ background: '#faf8ff' }}>
              <p className="text-sm font-black" style={{ color: '#7c3aed' }}>₪{ticket.price.toLocaleString()}</p>
              <p className="text-xs" style={{ color: '#9b8fb0' }}>מחיר</p>
            </div>
            <div className="rounded-lg px-3 py-2 text-center" style={{ background: '#faf8ff' }}>
              <p className="text-sm font-black" style={{ color: '#1a1a2e' }}>{ticket.sold}</p>
              <p className="text-xs" style={{ color: '#9b8fb0' }}>נמכרו</p>
            </div>
            <div className="rounded-lg px-3 py-2 text-center" style={{ background: '#faf8ff' }}>
              <p className="text-sm font-black" style={{ color: '#1a1a2e' }}>{remaining}</p>
              <p className="text-xs" style={{ color: '#9b8fb0' }}>נותרו</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
              <span>מכירות</span>
              <span>{soldPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
              <div className="h-full rounded-full" style={{ width: `${soldPct}%`, background: soldPct > 80 ? '#e94560' : '#7c3aed' }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button onClick={() => onToggle(ticket.id)} style={{ color: ticket.enabled ? '#7c3aed' : '#9b8fb0' }}>
            {ticket.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
          <div className="flex gap-1.5">
            <button className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#9b8fb0' }}><Edit3 size={14} /></button>
            <button className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: '#e94560' }}><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CouponRow({ coupon, onToggle }: { coupon: Coupon; onToggle: (id: string) => void }) {
  const usedPct = Math.round((coupon.usedCount / coupon.usageLimit) * 100);
  return (
    <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid #f3f0ff' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: coupon.type === 'percent' ? '#f0f9ff' : '#fff7ed', color: coupon.type === 'percent' ? '#0369a1' : '#c2410c' }}>
        {coupon.type === 'percent' ? <Percent size={14} /> : <DollarSign size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <code className="text-sm font-black px-2 py-0.5 rounded-lg" style={{ background: '#faf8ff', color: '#1a1a2e' }}>{coupon.code}</code>
          <span className="text-sm font-bold" style={{ color: '#7c3aed' }}>
            {coupon.type === 'percent' ? `${coupon.value}% הנחה` : `₪${coupon.value} הנחה`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: '#9b8fb0' }}>
          <span>{coupon.usedCount} / {coupon.usageLimit} שימושים</span>
          {coupon.expiresAt && <span className="flex items-center gap-0.5"><Calendar size={10} /> {coupon.expiresAt}</span>}
        </div>
        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-32" style={{ background: '#f3f0ff' }}>
          <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: usedPct > 80 ? '#e94560' : '#7c3aed' }} />
        </div>
      </div>
      <button onClick={() => onToggle(coupon.id)} style={{ color: coupon.enabled ? '#7c3aed' : '#9b8fb0' }}>
        {coupon.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
      </button>
    </div>
  );
}

interface NewTicketForm { name: string; price: string; quantity: string; description: string; min: string; max: string }
interface NewCouponForm { code: string; type: 'percent' | 'fixed'; value: string; limit: string; expires: string }

export default function TicketsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find(e => e.id === id);

  const [tickets, setTickets] = useState(mockTickets.filter(t => t.eventId === id));
  const [coupons, setCoupons] = useState(mockCoupons.filter(c => c.eventId === id));
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [ticketForm, setTicketForm] = useState<NewTicketForm>({ name: '', price: '', quantity: '', description: '', min: '1', max: '6' });
  const [couponForm, setCouponForm] = useState<NewCouponForm>({ code: '', type: 'percent', value: '', limit: '100', expires: '' });

  const toggleTicket = (tid: string) => setTickets(ts => ts.map(t => t.id === tid ? { ...t, enabled: !t.enabled } : t));
  const toggleCoupon = (cid: string) => setCoupons(cs => cs.map(c => c.id === cid ? { ...c, enabled: !c.enabled } : c));

  const addTicket = () => {
    const t: TicketType = {
      id: `t${Date.now()}`, eventId: id!, name: ticketForm.name, price: +ticketForm.price,
      quantity: +ticketForm.quantity, sold: 0, description: ticketForm.description,
      enabled: true, minPerOrder: +ticketForm.min, maxPerOrder: +ticketForm.max,
    };
    setTickets(ts => [...ts, t]);
    setShowTicketModal(false);
    setTicketForm({ name: '', price: '', quantity: '', description: '', min: '1', max: '6' });
  };

  const addCoupon = () => {
    const c: Coupon = {
      id: `c${Date.now()}`, eventId: id!, code: couponForm.code.toUpperCase(),
      type: couponForm.type, value: +couponForm.value, usageLimit: +couponForm.limit,
      usedCount: 0, expiresAt: couponForm.expires || undefined, enabled: true,
    };
    setCoupons(cs => [...cs, c]);
    setShowCouponModal(false);
    setCouponForm({ code: '', type: 'percent', value: '', limit: '100', expires: '' });
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate(`/organizer/events/${id}`)} className="flex items-center gap-1 text-sm font-medium hover:opacity-70" style={{ color: '#7c3aed' }}>
          <ArrowRight size={15} />
          {event?.name || 'אירוע'}
        </button>
        <span style={{ color: '#ddd6fe' }}>/</span>
        <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>ניהול כרטיסים</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket size={18} style={{ color: '#7c3aed' }} />
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>סוגי כרטיסים</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#f3f0ff', color: '#7c3aed' }}>{tickets.length}</span>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold hover:scale-105 transition-all"
              style={{ background: '#ffd433', color: '#1a1a2e' }}
            >
              <Plus size={13} /> כרטיס חדש
            </button>
          </div>
          <div className="space-y-3">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} onToggle={toggleTicket} />)}
            {tickets.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #ddd6fe' }}>
                <Ticket size={32} className="mx-auto mb-3" style={{ color: '#ddd6fe' }} />
                <p className="text-sm" style={{ color: '#9b8fb0' }}>אין כרטיסים עדיין</p>
              </div>
            )}
          </div>
        </div>

        {/* Coupons section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag size={18} style={{ color: '#8b5cf6' }} />
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>קופונים</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#ede9fe', color: '#7c3aed' }}>{coupons.length}</span>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold hover:scale-105 transition-all"
              style={{ background: '#ede9fe', color: '#7c3aed' }}
            >
              <Plus size={13} /> קופון חדש
            </button>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd6fe' }}>
            {coupons.length === 0 ? (
              <div className="p-8 text-center">
                <Tag size={32} className="mx-auto mb-3" style={{ color: '#ddd6fe' }} />
                <p className="text-sm" style={{ color: '#9b8fb0' }}>אין קופונים עדיין</p>
              </div>
            ) : (
              coupons.map(c => <CouponRow key={c.id} coupon={c} onToggle={toggleCoupon} />)
            )}
          </div>
        </div>
      </div>

      {/* Add ticket modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>כרטיס חדש</h2>
              <button onClick={() => setShowTicketModal(false)} style={{ color: '#9b8fb0' }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>שם הכרטיס *</label>
                <input value={ticketForm.name} onChange={e => setTicketForm(f => ({ ...f, name: e.target.value }))} style={inputBase} placeholder="כרטיס רגיל" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מחיר (₪)</label>
                  <input type="number" value={ticketForm.price} onChange={e => setTicketForm(f => ({ ...f, price: e.target.value }))} style={inputBase} placeholder="0" min="0" /></div>
                <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>כמות</label>
                  <input type="number" value={ticketForm.quantity} onChange={e => setTicketForm(f => ({ ...f, quantity: e.target.value }))} style={inputBase} placeholder="100" min="1" /></div>
              </div>
              <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>תיאור (אופציונלי)</label>
                <input value={ticketForm.description} onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))} style={inputBase} placeholder="כולל מתנה קטנה..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מינימום לרכישה</label>
                  <input type="number" value={ticketForm.min} onChange={e => setTicketForm(f => ({ ...f, min: e.target.value }))} style={inputBase} min="1" /></div>
                <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מקסימום לרכישה</label>
                  <input type="number" value={ticketForm.max} onChange={e => setTicketForm(f => ({ ...f, max: e.target.value }))} style={inputBase} min="1" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTicketModal(false)} className="flex-1 py-2.5 rounded-full text-sm font-bold" style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}>ביטול</button>
              <button onClick={addTicket} disabled={!ticketForm.name || !ticketForm.price || !ticketForm.quantity} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold" style={{ background: '#ffd433', color: '#1a1a2e' }}>
                <Save size={14} /> שמור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add coupon modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>קופון חדש</h2>
              <button onClick={() => setShowCouponModal(false)} style={{ color: '#9b8fb0' }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>קוד קופון *</label>
                <input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} style={{ ...inputBase, fontFamily: 'monospace', textTransform: 'uppercase' }} placeholder="SUMMER20" dir="ltr" /></div>
              <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>סוג הנחה</label>
                <div className="flex gap-2">
                  {(['percent', 'fixed'] as const).map(t => (
                    <button key={t} onClick={() => setCouponForm(f => ({ ...f, type: t }))} className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                      style={couponForm.type === t ? { background: '#7c3aed', color: '#fff' } : { background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}>
                      {t === 'percent' ? '% הנחה' : 'סכום קבוע'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>{couponForm.type === 'percent' ? 'אחוז הנחה' : 'סכום הנחה (₪)'}</label>
                  <input type="number" value={couponForm.value} onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))} style={inputBase} placeholder={couponForm.type === 'percent' ? '20' : '50'} min="1" /></div>
                <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מגבלת שימוש</label>
                  <input type="number" value={couponForm.limit} onChange={e => setCouponForm(f => ({ ...f, limit: e.target.value }))} style={inputBase} placeholder="100" min="1" /></div>
              </div>
              <div><label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>תאריך תפוגה (אופציונלי)</label>
                <input type="date" value={couponForm.expires} onChange={e => setCouponForm(f => ({ ...f, expires: e.target.value }))} style={inputBase} dir="ltr" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCouponModal(false)} className="flex-1 py-2.5 rounded-full text-sm font-bold" style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}>ביטול</button>
              <button onClick={addCoupon} disabled={!couponForm.code || !couponForm.value} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Save size={14} /> שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
