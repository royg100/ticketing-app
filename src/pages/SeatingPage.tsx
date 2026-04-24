import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Info } from 'lucide-react';
import { events } from '../data/events';
import SeatingMap from '../components/SeatingMap';
import { useCart } from '../context/CartContext';

export default function SeatingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { count, total, items } = useCart();
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ede9fe' }}>
        <div className="text-center bg-white rounded-2xl p-10" style={{ border: '1px solid #ddd6fe' }}>
          <p className="text-xl font-bold mb-4" style={{ color: '#1a1a2e' }}>אירוע לא נמצא</p>
          <button
            onClick={() => navigate('/')}
            className="font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
            style={{ background: '#ffd433', color: '#1a1a2e' }}
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Event header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #ddd6fe' }}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors hover:opacity-70"
            style={{ color: '#7c3aed' }}
          >
            <ArrowRight size={16} />
            כל האירועים
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{event.titleHe}</h1>
              <p className="text-sm mt-1" style={{ color: '#6b5a8a' }}>{event.artist} · {event.date} · {event.time}</p>
            </div>
            <div
              className="flex items-center gap-2 text-sm rounded-2xl px-4 py-3"
              style={{ background: '#ede9fe', color: '#7c3aed', border: '1px solid #c4b5fd' }}
            >
              <Info size={14} />
              לחץ על מקום פנוי כדי לבחור אותו
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* Seating map */}
          <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #ddd6fe' }}>
            <SeatingMap event={event} />
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            {/* Selected seats */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
              <h2 className="font-black mb-4 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <ShoppingCart size={16} style={{ color: '#7c3aed' }} />
                מקומות שנבחרו
                {count > 0 && (
                  <span
                    className="text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center mr-auto"
                    style={{ background: '#e94560' }}
                  >
                    {count}
                  </span>
                )}
              </h2>

              {items.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#9b8fb0' }}>
                  לא נבחרו מקומות עדיין
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {items.filter(i => i.event.id === event.id).map(item => (
                    <div
                      key={item.seat.id}
                      className="flex justify-between items-center rounded-xl px-3 py-2.5 text-sm"
                      style={{ background: '#faf8ff' }}
                    >
                      <div style={{ color: '#6b5a8a' }}>
                        שורה <strong style={{ color: '#1a1a2e' }}>{item.seat.row}</strong> מקום <strong style={{ color: '#1a1a2e' }}>{item.seat.number}</strong>
                      </div>
                      <div className="font-bold" style={{ color: '#1a1a2e' }}>₪{item.seat.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price summary */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between" style={{ color: '#6b5a8a' }}>
                  <span>כרטיסים ({count})</span>
                  <span>₪{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ color: '#6b5a8a' }}>
                  <span>עמלת שירות</span>
                  <span>₪{Math.round(total * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2" style={{ borderTop: '1px solid #ddd6fe', color: '#1a1a2e', paddingTop: '8px', marginTop: '8px' }}>
                  <span>סה"כ לתשלום</span>
                  <span>₪{Math.round(total * 1.05).toLocaleString()}</span>
                </div>
              </div>

              <button
                disabled={count === 0}
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 font-black py-3.5 rounded-full transition-all text-sm"
                style={
                  count === 0
                    ? { background: '#f3f0ff', color: '#9b8fb0', cursor: 'not-allowed' }
                    : { background: '#ffd433', color: '#1a1a2e' }
                }
              >
                {count === 0 ? 'בחר מקומות' : `המשך לתשלום (${count} כרטיסים)`}
              </button>
            </div>

            {/* Venue info */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9b8fb0' }}>על המקום</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b5a8a' }}>
                בריכת הסולטן היא אמפיתאטרון עתיק תחת כיפת השמיים בירושלים, הנמצא מחוץ לחומות העיר העתיקה ליד שער יפו.
              </p>
              <ul className="mt-2 space-y-1 text-xs" style={{ color: '#9b8fb0' }}>
                <li>· שערי כניסה נפתחים שעה לפני ההצגה</li>
                <li>· הגעה בתחבורה ציבורית מומלצת</li>
                <li>· אסור להכניס אוכל ושתייה מבחוץ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
