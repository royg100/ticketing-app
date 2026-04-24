import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import {
  ArrowRight, Search, Download, Filter,
  CheckCircle, XCircle, AlertCircle, RotateCcw, Mail,
  Phone, Ticket, ChevronDown, ChevronUp,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';

type Transaction = Doc<'transactions'>;

const RefundIcon2 = RotateCcw;

const STATUS_CONFIG = {
  success: { label: 'הצלחה', bg: '#dcfce7', color: '#15803d', icon: CheckCircle },
  failed: { label: 'כישלון', bg: '#fee2e2', color: '#b91c1c', icon: XCircle },
  cancelled: { label: 'בוטל', bg: '#fef9c3', color: '#a16207', icon: AlertCircle },
  refunded: { label: 'הוחזר', bg: '#f1f5f9', color: '#64748b', icon: RefundIcon2 },
  pending_bit: { label: 'ממתין (Bit)', bg: '#eff6ff', color: '#1d4ed8', icon: AlertCircle },
};

const CHECKIN_CONFIG = {
  'checked-in': { label: 'נכנס', bg: '#dcfce7', color: '#15803d' },
  pending: { label: 'טרם נכנס', bg: '#f1f5f9', color: '#64748b' },
};

type StatusFilter = 'all' | Transaction['status'];

function TransactionRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_CONFIG[tx.status];
  const Icon = st.icon;
  const checkin = CHECKIN_CONFIG[tx.checkInStatus];

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
        style={{ borderBottom: '1px solid #f3f0ff' }}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon size={14} style={{ color: st.color }} />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{tx.buyerName}</p>
          <p className="text-xs" style={{ color: '#9b8fb0' }}>{tx.buyerEmail}</p>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <div className="text-xs" style={{ color: '#6b5a8a' }}>
            {tx.tickets.map((t, i) => <p key={i}>{t.typeName} × {t.quantity}</p>)}
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <p className="text-sm font-black" style={{ color: '#1a1a2e' }}>₪{tx.total.toLocaleString()}</p>
          <p className="text-xs" style={{ color: '#9b8fb0' }}>+₪{tx.fee} עמלה</p>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: checkin.bg, color: checkin.color }}>{checkin.label}</span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: '#9b8fb0' }}>{tx.createdAt}</td>
        <td className="px-4 py-3">
          {expanded ? <ChevronUp size={14} style={{ color: '#9b8fb0' }} /> : <ChevronDown size={14} style={{ color: '#9b8fb0' }} />}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: '#fbfaff', borderBottom: '1px solid #ddd6fe' }}>
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: '#9b8fb0' }}>פרטי קונה</p>
                <p className="flex items-center gap-1.5 mb-1" style={{ color: '#1a1a2e' }}><Mail size={12} style={{ color: '#7c3aed' }} />{tx.buyerEmail}</p>
                <p className="flex items-center gap-1.5" style={{ color: '#1a1a2e' }}><Phone size={12} style={{ color: '#7c3aed' }} />{tx.buyerPhone}</p>
              </div>
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: '#9b8fb0' }}>QR Code</p>
                <code className="text-xs px-2 py-1 rounded-lg font-mono" style={{ background: '#faf8ff', color: '#7c3aed' }}>{tx.qrCode}</code>
                {tx.coupon && (
                  <p className="mt-1.5 text-xs" style={{ color: '#8b5cf6' }}>קופון: <strong>{tx.coupon}</strong></p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: '#9b8fb0' }}>פעולות</p>
                <div className="flex flex-wrap gap-2">
                  {tx.status === 'success' && (
                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                      <RotateCcw size={11} /> החזר
                    </button>
                  )}
                  <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: '#f3f0ff', color: '#7c3aed' }}>
                    <Ticket size={11} /> שלח כרטיס
                  </button>
                  <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: '#faf8ff', color: '#6b5a8a' }}>
                    <Mail size={11} /> שלח מייל
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function exportToCSV(txs: Transaction[], filename: string) {
  const headers = ['מספר עסקה', 'שם', 'אימייל', 'טלפון', 'כרטיסים', 'סכום', 'עמלה', 'סטטוס', 'כניסה', 'קופון', 'תאריך'];
  const rows = txs.map(tx => [
    tx._id,
    tx.buyerName,
    tx.buyerEmail,
    tx.buyerPhone,
    tx.tickets.map(t => `${t.typeName}×${t.quantity}`).join(' | '),
    tx.total,
    tx.fee,
    tx.status,
    tx.checkInStatus,
    tx.coupon ?? '',
    tx.createdAt,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = id as Id<'events'> | undefined;
  const event = useQuery(api.events.get, eventId ? { id: eventId } : 'skip');
  const txsByEvent = useQuery(api.transactions.listByEvent, eventId ? { eventId } : 'skip');
  const txsAll = useQuery(api.transactions.list, eventId ? 'skip' : {});
  const allTxs: Transaction[] = (eventId ? txsByEvent : txsAll) ?? [];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = allTxs.filter(tx => {
    const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || tx.buyerName.toLowerCase().includes(q) || tx.buyerEmail.toLowerCase().includes(q) || tx.buyerPhone.includes(q) || tx.qrCode.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = filtered.filter(t => t.status === 'success').reduce((s, t) => s + t.total, 0);
  const totalTickets = filtered.filter(t => t.status === 'success').reduce((s, t) => s + t.tickets.reduce((ts, tt) => ts + tt.quantity, 0), 0);

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {event && (
          <>
            <button onClick={() => navigate(`/organizer/events/${id}`)} className="flex items-center gap-1 text-sm font-medium hover:opacity-70" style={{ color: '#7c3aed' }}>
              <ArrowRight size={15} />
              {event.name}
            </button>
            <span style={{ color: '#ddd6fe' }}>/</span>
          </>
        )}
        <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>עסקאות {!event && 'כל האירועים'}</h1>
        <button
          onClick={() => exportToCSV(filtered, `עסקאות${event ? `-${event.name}` : ''}.csv`)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold mr-auto hover:opacity-80 transition-opacity"
          style={{ background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}
        >
          <Download size={13} />
          ייצוא CSV ({filtered.length})
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'סה"כ עסקאות', value: filtered.length.toString(), color: '#7c3aed' },
          { label: 'הצליחו', value: filtered.filter(t => t.status === 'success').length.toString(), color: '#15803d' },
          { label: 'כרטיסים', value: totalTickets.toString(), color: '#8b5cf6' },
          { label: 'הכנסה', value: `₪${totalRevenue.toLocaleString()}`, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl px-4 py-3 text-center" style={{ border: '1px solid #ddd6fe' }}>
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1" style={{ background: '#fff', border: '1px solid #ddd6fe' }}>
          <Search size={14} style={{ color: '#9b8fb0' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="שם, אימייל, טלפון, QR..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: '#1a1a2e' }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: '#fff', border: '1px solid #ddd6fe' }}>
          <Filter size={13} className="mx-2" style={{ color: '#9b8fb0' }} />
          {(['all', 'success', 'failed', 'cancelled', 'refunded'] as StatusFilter[]).map(s => {
            const count = s === 'all' ? allTxs.length : allTxs.filter(t => t.status === s).length;
            const labels: Record<string, string> = { all: 'הכל', success: 'הצלחה', failed: 'כישלון', cancelled: 'בוטל', refunded: 'הוחזר' };
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={statusFilter === s ? { background: '#7c3aed', color: '#fff' } : { color: '#9b8fb0' }}>
                {labels[s]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd6fe' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f0ff', background: '#fbfaff' }}>
                {['סטטוס', 'קונה', 'כרטיסים', 'סכום', 'כניסה', 'תאריך', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-right" style={{ color: '#9b8fb0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Search size={32} className="mx-auto mb-3" style={{ color: '#ddd6fe' }} />
                    <p className="text-sm" style={{ color: '#9b8fb0' }}>לא נמצאו עסקאות</p>
                  </td>
                </tr>
              ) : (
                filtered.map(tx => <TransactionRow key={tx._id} tx={tx} />)
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 text-xs" style={{ color: '#9b8fb0', borderTop: '1px solid #f3f0ff' }}>
            מציג {filtered.length} מתוך {allTxs.length} עסקאות
          </div>
        )}
      </div>
    </div>
  );
}
