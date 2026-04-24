import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { TrendingUp, Ticket, DollarSign, Users, Plus, ChevronLeft, Calendar, BarChart2, ArrowUpRight } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Doc } from '../../../convex/_generated/dataModel';

const STATUS_MAP = {
  active: { label: 'פעיל', bg: '#dcfce7', color: '#15803d' },
  draft: { label: 'טיוטה', bg: '#fef9c3', color: '#a16207' },
  paused: { label: 'מושהה', bg: '#fee2e2', color: '#b91c1c' },
  archived: { label: 'ארכיון', bg: '#f1f5f9', color: '#64748b' },
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, color }}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={14} style={{ color: '#9b8fb0' }} />
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: '#1a1a2e' }}>{value}</p>
      <p className="text-xs font-semibold" style={{ color: '#9b8fb0' }}>{label}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: '#7c3aed' }}>{sub}</p>}
    </div>
  );
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const events: Doc<'events'>[] = useQuery(api.events.list) ?? [];

  const totalRevenue = events.reduce((s, e) => s + e.revenue, 0);
  const totalSold = events.reduce((s, e) => s + e.soldTickets, 0);
  const activeEvents = events.filter(e => e.status === 'active').length;

  const recentEvents = [...events].sort((a, b) => b.soldTickets - a.soldTickets).slice(0, 4);

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>שלום, בריכת הסולטן 👋</h1>
          <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>הנה מה שקורה באירועים שלך היום</p>
        </div>
        <button
          onClick={() => navigate('/organizer/events/new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
          style={{ background: '#ffd433', color: '#1a1a2e' }}
        >
          <Plus size={16} />
          אירוע חדש
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="הכנסה כוללת" value={`₪${(totalRevenue / 1000).toFixed(0)}K`} sub="↑ 12% מהחודש שעבר" color="#7c3aed" />
        <StatCard icon={Ticket} label="כרטיסים נמכרו" value={totalSold.toLocaleString()} sub='סה"כ כל האירועים' color="#8b5cf6" />
        <StatCard icon={Calendar} label="אירועים פעילים" value={activeEvents.toString()} sub={`מתוך ${events.length} אירועים`} color="#f59e0b" />
        <StatCard icon={Users} label="קונים ייחודיים" value="1,240" sub="↑ 8% מהחודש שעבר" color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Events table */}
        <div className="bg-white rounded-2xl" style={{ border: '1px solid #ddd6fe' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #ddd6fe' }}>
            <h2 className="font-black" style={{ color: '#1a1a2e' }}>אירועים</h2>
            <button
              onClick={() => navigate('/organizer/events')}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#7c3aed' }}
            >
              הכל <ChevronLeft size={13} />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: '#ddd6fe' }}>
            {recentEvents.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Calendar size={32} className="mx-auto mb-3" style={{ color: '#ddd6fe' }} />
                <p className="text-sm" style={{ color: '#9b8fb0' }}>אין עדיין אירועים. צור אירוע חדש כדי להתחיל.</p>
              </div>
            )}
            {recentEvents.map(ev => {
              const pct = ev.totalTickets > 0 ? Math.round((ev.soldTickets / ev.totalTickets) * 100) : 0;
              const st = STATUS_MAP[ev.status];
              return (
                <div
                  key={ev._id}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => navigate(`/organizer/events/${ev._id}`)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 text-sm" style={{ background: '#7c3aed' }}>
                    {ev.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm truncate" style={{ color: '#1a1a2e' }}>{ev.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#9b8fb0' }}>{ev.date} · {ev.venue}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
                        <span>{ev.soldTickets.toLocaleString()} / {ev.totalTickets.toLocaleString()} כרטיסים</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 70 ? '#e94560' : pct > 40 ? '#f59e0b' : '#7c3aed' }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>₪{(ev.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>הכנסה</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions + mini chart */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <h2 className="font-black mb-4" style={{ color: '#1a1a2e' }}>פעולות מהירות</h2>
            <div className="space-y-2">
              {[
                { icon: Plus, label: 'צור אירוע חדש', to: '/organizer/events/new', yellow: true },
                { icon: Ticket, label: 'נהל אירועים', to: '/organizer/events', yellow: false },
                { icon: Users, label: 'ייצוא רשימת קונים', to: '/organizer/transactions', yellow: false },
                { icon: BarChart2, label: 'דוח מכירות', to: '/organizer/reports', yellow: false },
              ].map(({ icon: Icon, label, to, yellow }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={yellow ? { background: '#ffd433', color: '#1a1a2e' } : { background: '#faf8ff', color: '#1a1a2e', border: '1px solid #ddd6fe' }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mini stats */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: '#7c3aed' }} />
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>מגמת מכירות</h2>
            </div>
            <div className="space-y-3">
              {[
                { day: 'היום', val: 87, revenue: '₪24,360' },
                { day: 'אתמול', val: 65, revenue: '₪18,200' },
                { day: 'לפני שבוע', val: 42, revenue: '₪11,760' },
              ].map(({ day, val, revenue }) => (
                <div key={day}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
                    <span>{day}</span>
                    <span className="font-bold" style={{ color: '#1a1a2e' }}>{revenue}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: '#7c3aed' }} />
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
