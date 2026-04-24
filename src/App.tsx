import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import BuyerNavPanel from './components/buyer/BuyerNavPanel';
import BuyerNavDrawer from './components/buyer/BuyerNavDrawer';
import EventsPage from './pages/EventsPage';
import SeatingPage from './pages/SeatingPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';

// Organizer
import OrganizerLayout from './components/organizer/OrganizerLayout';
import LoginPage from './pages/organizer/LoginPage';
import LobbyPage from './pages/organizer/LobbyPage';
import EventsListPage from './pages/organizer/EventsListPage';
import EventEditPage from './pages/organizer/EventEditPage';
import TicketsPage from './pages/organizer/TicketsPage';
import TransactionsPage from './pages/organizer/TransactionsPage';
import RealtimeDashboard from './pages/organizer/RealtimeDashboard';
import POSPage from './pages/organizer/POSPage';
import MessagingPage from './pages/organizer/MessagingPage';
import LecturesPage from './pages/organizer/LecturesPage';
import ReportsPage from './pages/organizer/ReportsPage';
import TeamPage from './pages/organizer/TeamPage';
import SettingsPage from './pages/organizer/SettingsPage';

function BuyerLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: '#ede9fe' }}>
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen overflow-hidden bg-white"
        style={{ borderInlineStart: '1px solid #ddd6fe' }}
        aria-label="תפריט צד"
      >
        <div className="p-4 border-b" style={{ borderColor: '#ddd6fe' }}>
          <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>
            טיקסיט
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#9b8fb0' }}>
            בחרו אירוע או חזרו לכל הרשימה
          </p>
        </div>
        <div className="p-3 flex-1 min-h-0 flex flex-col overflow-y-auto">
          <BuyerNavPanel />
        </div>
      </aside>

      <BuyerNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          onCartOpen={() => setCartOpen(true)}
          onOpenSideNav={() => setNavOpen(true)}
        />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:id" element={<SeatingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Buyer-facing routes */}
        <Route path="/*" element={
          <CartProvider>
            <BuyerLayout />
          </CartProvider>
        } />

        {/* Organizer login (no layout) */}
        <Route path="/organizer/login" element={<LoginPage />} />

        {/* Organizer dashboard (with sidebar layout) */}
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route index element={<Navigate to="/organizer/lobby" replace />} />
          <Route path="lobby" element={<LobbyPage />} />
          <Route path="events" element={<EventsListPage />} />
          <Route path="events/new" element={<EventEditPage />} />
          <Route path="events/:id" element={<EventEditPage />} />
          <Route path="events/:id/tickets" element={<TicketsPage />} />
          <Route path="events/:id/lectures" element={<LecturesPage />} />
          <Route path="events/:id/transactions" element={<TransactionsPage />} />
          <Route path="events/:id/dashboard" element={<RealtimeDashboard />} />
          <Route path="events/:id/pos" element={<POSPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="messaging" element={<MessagingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
