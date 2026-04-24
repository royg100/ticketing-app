import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Calendar, MapPin, Ticket, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { mockLectures } from '../data/organizer';

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function QRCode({ value, size = 120 }: { value: string; size?: number }) {
  const GRID = 21;
  const cellSize = size / GRID;
  const hash = hashCode(value);

  const isFixed = (r: number, c: number) => {
    const finderPattern = (row: number, col: number) =>
      (row <= 6 && col <= 6) || (row <= 6 && col >= GRID - 7) || (row >= GRID - 7 && col <= 6);
    if (finderPattern(r, c)) {
      const inR = r <= 6 ? r : r - (GRID - 7);
      const inC = c <= 6 ? c : c >= GRID - 7 ? c - (GRID - 7) : c;
      const border = inR === 0 || inR === 6 || inC === 0 || inC === 6;
      const center = inR >= 2 && inR <= 4 && inC >= 2 && inC <= 4;
      return border || center;
    }
    if (r === 6 && c % 2 === 0) return true;
    if (c === 6 && r % 2 === 0) return true;
    return false;
  };

  const isFinder = (r: number, c: number) =>
    (r <= 7 && c <= 7) || (r <= 7 && c >= GRID - 8) || (r >= GRID - 8 && c <= 7);

  const cells: { r: number; c: number; dark: boolean }[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      let dark = false;
      if (isFixed(r, c)) {
        dark = true;
      } else if (!isFinder(r, c) && r !== 6 && c !== 6) {
        const bit = (hash >> ((r * GRID + c) % 30)) & 1;
        dark = bit === 1;
      }
      cells.push({ r, c, dark });
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block' }}
      aria-label={`QR Code: ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {cells.map(({ r, c, dark }) =>
        dark ? (
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#1a1a2e"
          />
        ) : null,
      )}
    </svg>
  );
}

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { selectedLectures } = useCart();
  const orderNumber = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrValue = `TICK:EV1:${orderNumber}`;
  const chosenLectures = selectedLectures
    .map(sel => mockLectures.find(l => l.id === sel.lectureId))
    .filter(Boolean) as typeof mockLectures;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#ede9fe' }}>
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: '#d4f7ee' }}
          >
            <CheckCircle size={44} style={{ color: '#00b894' }} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black" style={{ color: '#1a1a2e' }}>הרכישה הושלמה!</h1>
          <p className="mt-2" style={{ color: '#6b5a8a' }}>הכרטיסים ישלחו לאימייל שלך תוך מספר דקות</p>
        </div>

        {/* Digital ticket */}
        <div className="bg-white rounded-2xl overflow-hidden text-right" style={{ border: '1px solid #ddd6fe' }}>
          {/* Ticket header */}
          <div className="px-6 pt-6 pb-4" style={{ background: '#1a1a2e' }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#7c3aed' }}>
                <Ticket size={22} color="white" />
              </div>
              <div>
                <p className="font-black text-lg leading-tight" style={{ color: '#fff' }}>פסטיבל בריכת הסולטן</p>
                <p className="text-sm mt-0.5" style={{ color: '#a78bfa' }}>ליל הקיץ – ירושלים</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#ddd6fe' }}>
                <Calendar size={13} style={{ color: '#a78bfa' }} />
                <span>15 ביוני 2025 · 19:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#ddd6fe' }}>
                <MapPin size={13} style={{ color: '#a78bfa' }} />
                <span>בריכת הסולטן, ירושלים · כניסה משער יפו</span>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative flex items-center px-0 py-0" style={{ background: '#ede9fe' }}>
            <div className="w-6 h-6 rounded-full shrink-0" style={{ background: '#ede9fe', marginRight: -12, zIndex: 1 }} />
            <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: '#c4b5fd' }} />
            <div className="w-6 h-6 rounded-full shrink-0" style={{ background: '#ede9fe', marginLeft: -12, zIndex: 1 }} />
          </div>

          {/* QR + order info */}
          <div className="px-6 pb-4 pt-4 flex items-center gap-5 justify-between">
            <div className="text-right">
              <p className="text-xs font-bold mb-1" style={{ color: '#9b8fb0' }}>מספר הזמנה</p>
              <p className="font-black text-lg font-mono" style={{ color: '#1a1a2e' }}>{orderNumber}</p>
              <p className="text-xs mt-3" style={{ color: '#9b8fb0' }}>סרוק בכניסה לאירוע</p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: '#c4b5fd', fontSize: '10px' }}>{qrValue}</p>
            </div>
            <div className="rounded-xl overflow-hidden shrink-0" style={{ border: '3px solid #1a1a2e', padding: '4px', background: 'white' }}>
              <QRCode value={qrValue} size={110} />
            </div>
          </div>

          {/* Selected lectures */}
          {chosenLectures.length > 0 && (
            <div className="mx-4 mb-5 rounded-xl p-3" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
              <p className="text-xs font-black mb-2 flex items-center gap-1.5" style={{ color: '#7c3aed' }}>
                <BookOpen size={12} />
                הרצאות שנרשמת אליהן
              </p>
              <div className="space-y-1.5">
                {chosenLectures.map(lec => (
                  <div key={lec.id} className="flex items-start gap-2">
                    <span className="text-xs font-bold shrink-0" style={{ color: '#a78bfa', minWidth: 40 }}>{lec.startTime}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#1a1a2e' }}>{lec.title}</p>
                      <p className="text-xs" style={{ color: '#9b8fb0' }}>{lec.location} · {lec.speaker}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order number summary */}
        <div className="bg-white rounded-2xl p-5 flex items-center justify-between" style={{ border: '1px solid #ddd6fe' }}>
          <span className="text-sm" style={{ color: '#9b8fb0' }}>סה"כ שולם</span>
          <span className="font-black text-xl" style={{ color: '#1a1a2e' }}>₪280</span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            className="w-full font-black py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
            style={{ background: '#ffd433', color: '#1a1a2e' }}
          >
            <Download size={16} />
            הורד כרטיס (PDF)
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full font-bold py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
            style={{ background: 'white', color: '#1a1a2e', border: '1px solid #ddd6fe' }}
          >
            <Home size={16} />
            חזרה לאירועים
          </button>
        </div>

        <p className="text-xs" style={{ color: '#9b8fb0' }}>
          לכל שאלה: support@tickchak.co.il
        </p>
      </div>
    </div>
  );
}
