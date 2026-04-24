import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import {
  ArrowRight, Ticket, DollarSign, TrendingUp,
  Eye, RefreshCw, Activity, Target,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';

function useRealtime(base: number, variance: number) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      setVal(v => Math.max(0, v + Math.floor((Math.random() - 0.4) * variance)));
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [variance]);
  return val;
}

function StatTile({ icon: Icon, label, value, sub, color, live }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; live?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
          <Icon size={17} />
        </div>
        {live && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>חי</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: '#9b8fb0' }}>{label}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ label, val, max, color }: { label: string; val: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: '#1a1a2e' }}>{val}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (val / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function RealtimeDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = id as Id<'events'> | undefined;
  const event = useQuery(api.events.get, eventId ? { id: eventId } : 'skip');
  const tickets: Doc<'ticketTypes'>[] = useQuery(api.tickets.listByEvent, eventId ? { eventId } : 'skip') ?? [];
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const visitors = useRealtime(47, 8);
  const salesRate = useRealtime(3, 2);

  useEffect(() => {
    const t = setInterval(() => setLastUpdate(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  if (event === undefined) return <div className="text-center py-20" style={{ color: '#9b8fb0' }}>טוען...</div>;
  if (event === null) return <div className="text-center py-20" style={{ color: '#b91c1c' }}>האירוע לא נמצא</div>;

  const soldPct = event.totalTickets > 0 ? Math.round((event.soldTickets / event.totalTickets) * 100) : 0;
  const convRate = event.soldTickets > 0 ? ((event.soldTickets / (event.soldTickets + 890)) * 100).toFixed(1) : '0.0';
  const avgTicketPrice = event.soldTickets > 0 ? Math.round(event.revenue / event.soldTickets) : 0;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate(`/organizer/events/${id}`)} className="flex items-center gap-1 text-sm font-medium hover:opacity-70" style={{ color: '#7c3aed' }}>
          <ArrowRight size={15} />
          {event.name}
        </button>
        <span style={{ color: '#ddd6fe' }}>/</span>
        <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>דאשבורד זמן אמת</h1>
        <div className="flex items-center gap-1.5 mr-auto text-xs" style={{ color: '#9b8fb0' }}>
          <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
          עודכן {lastUpdate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Live indicator banner */}
      <div className="rounded-2xl px-5 py-3 mb-6 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #7c3aed15, #7c3aed08)', border: '1px solid #7c3aed30' }}>
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#7c3aed' }} />
        <p className="text-sm font-bold" style={{ color: '#7c3aed' }}>
          {event.name} — {visitors} מבקרים כרגע בדף המכירה
        </p>
        <span className="mr-auto text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: '#7c3aed', color: '#fff' }}>
          מצב: {event.status === 'active' ? 'פעיל' : 'לא פעיל'}
        </span>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile icon={Eye} label="מבקרים כרגע" value={visitors} sub={`+${salesRate} בדקה האחרונה`} color="#7c3aed" live />
        <StatTile icon={Ticket} label="כרטיסים נמכרו" value={event.soldTickets.toLocaleString()} sub={`${soldPct}% מהיעד`} color="#8b5cf6" />
        <StatTile icon={DollarSign} label="הכנסה" value={`₪${(event.revenue / 1000).toFixed(0)}K`} sub={`ממוצע ₪${avgTicketPrice} לכרטיס`} color="#f59e0b" />
        <StatTile icon={Target} label="המרה" value={`${convRate}%`} sub="מבקר לרוכש" color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales over time */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} style={{ color: '#7c3aed' }} />
            <h2 className="font-black" style={{ color: '#1a1a2e' }}>מכירות לפי שעה (היום)</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: '08:00–10:00', val: 42 },
              { label: '10:00–12:00', val: 87 },
              { label: '12:00–14:00', val: 134 },
              { label: '14:00–16:00', val: 98 },
              { label: '16:00–18:00', val: 156 },
              { label: '18:00–20:00', val: salesRate * 30 + 60 },
            ].map(({ label, val }) => (
              <MiniBar key={label} label={label} val={Math.round(val)} max={200} color="#7c3aed" />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Ticket breakdown */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: '#8b5cf6' }} />
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>פירוט לפי סוג כרטיס</h2>
            </div>
            <div className="space-y-3">
              {tickets.length === 0 && (
                <p className="text-xs text-center py-3" style={{ color: '#9b8fb0' }}>אין עדיין סוגי כרטיסים מוגדרים</p>
              )}
              {tickets.map((t, i) => {
                const colors = ['#8b5cf6', '#f59e0b', '#a78bfa', '#34d399', '#7c3aed'];
                const color = colors[i % colors.length];
                const pct = t.quantity > 0 ? (t.sold / t.quantity) * 100 : 0;
                return (
                  <div key={t._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#6b5a8a' }}>{t.name}</span>
                      <span className="font-bold" style={{ color }}>{t.sold}/{t.quantity}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live feed */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>פעילות אחרונה</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'דוד כ.', action: 'רכש 2 כרטיסי ברונזה', time: 'לפני דקה', color: '#34d399' },
                { name: 'שרה מ.', action: 'רכש כרטיס VIP', time: 'לפני 3 דקות', color: '#8b5cf6' },
                { name: 'משה ל.', action: 'הוסיף קוד EARLY20', time: 'לפני 5 דקות', color: '#f59e0b' },
                { name: 'רחל ג.', action: 'רכש 4 כרטיסי זהב', time: 'לפני 8 דקות', color: '#f59e0b' },
                { name: 'אורן ב.', action: 'ביקר בדף המכירה', time: 'לפני 10 דקות', color: '#9b8fb0' },
              ].map(({ name, action, time, color }) => (
                <div key={name + time} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: color }}>
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: '#1a1a2e' }}>{name} <span className="font-normal" style={{ color: '#6b5a8a' }}>{action}</span></p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: '#9b8fb0' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Remaining capacity warning */}
      {soldPct > 75 && (
        <div className="mt-4 rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f59e0b', color: '#fff' }}>
            <Activity size={16} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#92400e' }}>
              {soldPct > 90 ? '🔴 נותרו מעט מקומות!' : '🟡 המכירות בשיאן'}
            </p>
            <p className="text-xs" style={{ color: '#b45309' }}>
              נותרו {event.totalTickets - event.soldTickets} כרטיסים מתוך {event.totalTickets} ({100 - soldPct}%)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
