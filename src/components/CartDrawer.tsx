import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

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

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, total } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,30,40,0.35)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#ffffff', borderRight: '1px solid #ddd6fe' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #ddd6fe' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: '#7c3aed' }} />
            <h2 className="font-black text-lg" style={{ color: '#1a1a2e' }}>סל הקניות</h2>
            {items.length > 0 && (
              <span
                className="text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center"
                style={{ background: '#e94560' }}
              >
                {items.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="transition-opacity hover:opacity-60" style={{ color: '#9b8fb0' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: '#9b8fb0' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3 }} />
            <p className="font-semibold">הסל ריק</p>
            <p className="text-sm">בחר מקומות על המפה</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(item => (
                <div
                  key={item.seat.id}
                  className="rounded-2xl p-4"
                  style={{ background: '#faf8ff', border: '1px solid #ddd6fe' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{item.event.titleHe}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{item.event.time} · {item.event.date}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {[
                          SECTION_NAMES[item.seat.section] || item.seat.section,
                          `שורה ${item.seat.row}`,
                          `מקום ${item.seat.number}`,
                        ].map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: '#ede9fe', color: '#7c3aed' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.seat.id)}
                      className="transition-opacity hover:opacity-60 ml-2 mt-0.5"
                      style={{ color: '#9b8fb0' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <span className="font-black" style={{ color: '#1a1a2e' }}>₪{item.seat.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 space-y-4" style={{ borderTop: '1px solid #ddd6fe' }}>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#6b5a8a' }}>סה"כ ({items.length} כרטיסים)</span>
                <span className="text-xl font-black" style={{ color: '#1a1a2e' }}>₪{total.toLocaleString()}</span>
              </div>
              <button
                onClick={() => { onClose(); navigate('/checkout'); }}
                className="w-full font-black py-3.5 rounded-full transition-all text-base"
                style={{ background: '#ffd433', color: '#1a1a2e' }}
              >
                המשך לתשלום
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
