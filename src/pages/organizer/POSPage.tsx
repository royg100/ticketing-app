import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ScanLine, CheckCircle, XCircle, Keyboard,
  Users, Ticket, AlertTriangle, RotateCcw, Search,
} from 'lucide-react';
import { mockTransactions, mockEvents } from '../../data/organizer';

type ScanResult = 'idle' | 'success' | 'already' | 'invalid' | 'not-found';

const RESULT_CONFIG: Record<ScanResult, { label: string; sub: string; bg: string; color: string; icon: React.ElementType } | null> = {
  idle: null,
  success: { label: 'כניסה מאושרת ✓', sub: 'הכרטיס תקף', bg: '#dcfce7', color: '#15803d', icon: CheckCircle },
  already: { label: 'כרטיס כבר נסרק', sub: 'כניסה כפולה — נסרק קודם', bg: '#fef9c3', color: '#a16207', icon: AlertTriangle },
  invalid: { label: 'כרטיס לא תקף', sub: 'הכרטיס בוטל או הוחזר', bg: '#fee2e2', color: '#b91c1c', icon: XCircle },
  'not-found': { label: 'לא נמצא', sub: 'קוד QR לא קיים במערכת', bg: '#fee2e2', color: '#b91c1c', icon: XCircle },
};

export default function POSPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find(e => e.id === id);

  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult>('idle');
  const [scannedTx, setScannedTx] = useState<typeof mockTransactions[0] | null>(null);
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set(
    mockTransactions.filter(t => t.checkInStatus === 'checked-in').map(t => t.id)
  ));
  const [history, setHistory] = useState<{ code: string; result: ScanResult; name: string; time: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const txs = mockTransactions.filter(t => t.eventId === (id || 'ev1'));

  const scan = (code: string) => {
    const q = code.trim().toUpperCase();
    if (!q) return;

    const tx = txs.find(t => t.qrCode === q || t.id === q.toLowerCase());
    let result: ScanResult;
    let name = '';

    if (!tx) {
      result = 'not-found';
      name = 'לא נמצא';
    } else if (tx.status !== 'success') {
      result = 'invalid';
      name = tx.buyerName;
    } else if (checkedIn.has(tx.id)) {
      result = 'already';
      name = tx.buyerName;
      setScannedTx(tx);
    } else {
      result = 'success';
      name = tx.buyerName;
      setScannedTx(tx);
      setCheckedIn(s => new Set([...s, tx.id]));
    }

    setScanResult(result);
    setHistory(h => [{ code: q, result, name, time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) }, ...h.slice(0, 9)]);
    setManualCode('');
    setTimeout(() => { if (result === 'success') setScanResult('idle'); }, 3000);
  };

  const totalCheckedIn = checkedIn.size;
  const totalSuccessful = txs.filter(t => t.status === 'success').length;

  const cfg = RESULT_CONFIG[scanResult];

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
        <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>קופה / סריקת כניסות</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl px-4 py-4 text-center" style={{ border: '1px solid #ddd6fe' }}>
          <p className="text-2xl font-black" style={{ color: '#7c3aed' }}>{totalCheckedIn}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>נכנסו</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-4 text-center" style={{ border: '1px solid #ddd6fe' }}>
          <p className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{totalSuccessful - totalCheckedIn}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>טרם נכנסו</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-4 text-center" style={{ border: '1px solid #ddd6fe' }}>
          <p className="text-2xl font-black" style={{ color: '#f59e0b' }}>{totalSuccessful}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>כרטיסים</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner panel */}
        <div className="space-y-4">
          {/* Scan result */}
          <div
            className="rounded-2xl p-6 text-center transition-all duration-300"
            style={{
              border: `2px solid ${cfg ? cfg.color + '40' : '#ddd6fe'}`,
              background: cfg ? cfg.bg : '#fff',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {scanResult === 'idle' ? (
              <>
                <ScanLine size={48} className="mb-3" style={{ color: '#ddd6fe' }} />
                <p className="font-bold" style={{ color: '#9b8fb0' }}>ממתין לסריקה...</p>
                <p className="text-xs mt-1" style={{ color: '#b8a9d0' }}>סרוק QR Code או הקלד קוד ידנית</p>
              </>
            ) : cfg ? (
              <>
                <cfg.icon size={48} className="mb-3" style={{ color: cfg.color }} />
                <p className="text-xl font-black" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="text-sm mt-1" style={{ color: cfg.color + 'aa' }}>{cfg.sub}</p>
                {scannedTx && (
                  <div className="mt-4 px-4 py-3 rounded-xl text-sm w-full" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p className="font-black" style={{ color: '#1a1a2e' }}>{scannedTx.buyerName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{scannedTx.tickets.map(t => `${t.typeName} ×${t.quantity}`).join(' · ')}</p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Manual input */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={15} style={{ color: '#7c3aed' }} />
              <h3 className="font-black text-sm" style={{ color: '#1a1a2e' }}>הזנה ידנית</h3>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && scan(manualCode)}
                placeholder="QR-EV1-TX1-... או מזהה עסקה"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: '#faf8ff', border: '1.5px solid #ddd6fe', color: '#1a1a2e' }}
                dir="ltr"
                autoFocus
              />
              <button
                onClick={() => scan(manualCode)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#7c3aed', color: '#fff' }}
              >
                סרוק
              </button>
            </div>

            {/* Quick test buttons */}
            <div className="mt-3">
              <p className="text-xs mb-2" style={{ color: '#9b8fb0' }}>בדיקה מהירה:</p>
              <div className="flex flex-wrap gap-2">
                {txs.slice(0, 4).map(tx => (
                  <button
                    key={tx.id}
                    onClick={() => scan(tx.qrCode)}
                    className="text-xs px-2.5 py-1 rounded-lg font-mono"
                    style={{ background: '#faf8ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}
                  >
                    {tx.qrCode.split('-').slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() => { setScanResult('idle'); setScannedTx(null); inputRef.current?.focus(); }}
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}
          >
            <RotateCcw size={14} />
            איפוס
          </button>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Scan history */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #f3f0ff' }}>
              <RotateCcw size={14} style={{ color: '#7c3aed' }} />
              <h3 className="font-black text-sm" style={{ color: '#1a1a2e' }}>היסטוריית סריקות</h3>
            </div>
            <div className="divide-y" style={{ borderColor: '#f3f0ff', maxHeight: '280px', overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <ScanLine size={24} className="mx-auto mb-2" style={{ color: '#ddd6fe' }} />
                  <p className="text-xs" style={{ color: '#9b8fb0' }}>אין סריקות עדיין</p>
                </div>
              ) : (
                history.map((h, i) => {
                  const hcfg = RESULT_CONFIG[h.result];
                  const HIcon = hcfg?.icon ?? CheckCircle;
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <HIcon size={16} style={{ color: hcfg?.color ?? '#9b8fb0' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: '#1a1a2e' }}>{h.name}</p>
                        <code className="text-xs truncate block" style={{ color: '#9b8fb0' }}>{h.code}</code>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold" style={{ color: hcfg?.color }}>{hcfg?.label}</p>
                        <p className="text-xs" style={{ color: '#9b8fb0' }}>{h.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Guest list search */}
          <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} style={{ color: '#7c3aed' }} />
              <h3 className="font-black text-sm" style={{ color: '#1a1a2e' }}>רשימת אורחים</h3>
            </div>
            <div className="flex items-center gap-2 mb-3 rounded-xl px-3 py-2" style={{ background: '#faf8ff', border: '1px solid #ddd6fe' }}>
              <Search size={13} style={{ color: '#9b8fb0' }} />
              <input placeholder="חיפוש לפי שם..." className="flex-1 text-xs outline-none bg-transparent" style={{ color: '#1a1a2e' }} />
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {txs.filter(t => t.status === 'success').slice(0, 8).map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-3 py-2 rounded-xl text-xs" style={{ background: '#fbfaff' }}>
                  <div>
                    <p className="font-bold" style={{ color: '#1a1a2e' }}>{tx.buyerName}</p>
                    <p style={{ color: '#9b8fb0' }}>{tx.tickets[0].typeName} ×{tx.tickets[0].quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkedIn.has(tx.id) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#dcfce7', color: '#15803d' }}>נכנס</span>
                    ) : (
                      <button
                        onClick={() => { setCheckedIn(s => new Set([...s, tx.id])); }}
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: '#f3f0ff', color: '#7c3aed' }}
                      >
                        <Ticket size={10} className="inline mr-0.5" /> אשר
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
