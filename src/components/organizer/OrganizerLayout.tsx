import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Ticket, BarChart2, Users,
  MessageSquare, Settings, LogOut, ChevronLeft, Menu, X,
  Bell, Search, ShoppingBag,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/organizer/lobby', icon: LayoutDashboard, label: 'לובי' },
  { to: '/organizer/events', icon: Calendar, label: 'אירועים' },
  { to: '/organizer/transactions', icon: ShoppingBag, label: 'עסקאות' },
  { to: '/organizer/messaging', icon: MessageSquare, label: 'הודעות' },
  { to: '/organizer/reports', icon: BarChart2, label: 'דוחות' },
  { to: '/organizer/team', icon: Users, label: 'צוות' },
  { to: '/organizer/settings', icon: Settings, label: 'הגדרות' },
];

const ACTIVE_STYLE = { background: '#7c3aed', color: '#ffffff' };
const IDLE_STYLE = { color: '#6b5a8a' };

export default function OrganizerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: '#ddd6fe' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: '#ffd433', color: '#1a1a2e' }}>
            T
          </div>
          <div>
            <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>טיקסיט</p>
            <p className="text-xs" style={{ color: '#9b8fb0' }}>פורטל מארגן</p>
          </div>
        </div>
      </div>

      {/* Account badge */}
      <div className="mx-3 my-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5" style={{ background: '#faf8ff', border: '1px solid #ddd6fe' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ background: '#7c3aed' }}>
          בה
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate" style={{ color: '#1a1a2e' }}>בריכת הסולטן פסטיבלים</p>
          <p className="text-xs truncate" style={{ color: '#9b8fb0' }}>admin@sultan.co.il</p>
        </div>
        <ChevronLeft size={14} style={{ color: '#9b8fb0' }} className="shrink-0" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={({ isActive }) => isActive ? ACTIVE_STYLE : IDLE_STYLE}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: '#ddd6fe' }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={IDLE_STYLE}
        >
          <Ticket size={17} />
          צפייה בדף מכירה
        </a>
        <button
          onClick={() => navigate('/organizer/login')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ color: '#e94560' }}
        >
          <LogOut size={17} />
          התנתקות
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#faf8ff', direction: 'rtl' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 w-56 bg-white"
        style={{ borderLeft: '1px solid #ddd6fe', position: 'sticky', top: 0, height: '100vh' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-56 bg-white flex flex-col" style={{ borderLeft: '1px solid #ddd6fe' }}>
            <button
              className="absolute top-4 left-4"
              onClick={() => setSidebarOpen(false)}
              style={{ color: '#9b8fb0' }}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #ddd6fe', position: 'sticky', top: 0, zIndex: 10 }}>
          <button
            className="lg:hidden p-1.5 rounded-lg"
            onClick={() => setSidebarOpen(true)}
            style={{ color: '#6b5a8a' }}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: '#faf8ff', border: '1px solid #ddd6fe', color: '#9b8fb0' }}>
            <Search size={14} />
            <span>חיפוש מהיר...</span>
          </div>

          <div className="flex items-center gap-2 mr-auto">
            <button className="p-2 rounded-xl relative" style={{ color: '#6b5a8a' }}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#e94560' }} />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: '#7c3aed' }}>
              בה
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
