import { ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onCartOpen: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-white sticky top-0 z-30" style={{ borderBottom: '1px solid #ddd6fe' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl font-black text-white text-sm"
            style={{ background: '#7c3aed' }}
          >
            T
          </div>
          <div className="leading-none">
            <span className="font-black text-lg" style={{ color: '#1a1a2e' }}>טיקסיט</span>
            <span className="text-xs font-normal block" style={{ color: '#9b8fb0' }}>בריכת הסולטן</span>
          </div>
        </button>

        {/* Organizer link */}
        <button
          onClick={() => navigate('/organizer/login')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-80"
          style={{ border: '1.5px solid #ddd6fe', color: '#7c3aed', background: '#faf8ff' }}
        >
          <LayoutDashboard size={13} />
          כניסה למארגן
        </button>

        {/* Cart */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all"
          style={{ background: '#ffd433', color: '#1a1a2e' }}
        >
          <ShoppingCart size={18} />
          <span>סל הקניות</span>
          {count > 0 && (
            <span
              className="absolute -top-1.5 -left-1.5 text-white text-xs font-black rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
              style={{ background: '#e94560' }}
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
