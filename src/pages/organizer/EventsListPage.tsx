import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { Plus, Search, Filter, Calendar, MapPin, Ticket, MoreVertical, Copy, Pause, Archive, BarChart2, Eye } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';

type OrganizerEvent = Doc<'events'>;

const STATUS_MAP = {
  active: { label: 'פעיל', bg: '#dcfce7', color: '#15803d' },
  draft: { label: 'טיוטה', bg: '#fef9c3', color: '#a16207' },
  paused: { label: 'מושהה', bg: '#fee2e2', color: '#b91c1c' },
  archived: { label: 'ארכיון', bg: '#f1f5f9', color: '#64748b' },
};

type Filter = 'all' | OrganizerEvent['status'];

function EventRow({ event, onNavigate, onDuplicate, onStatusChange }: {
  event: OrganizerEvent;
  onNavigate: (id: string) => void;
  onDuplicate: (id: Id<'events'>) => void;
  onStatusChange: (id: Id<'events'>, status: OrganizerEvent['status']) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pct = event.totalTickets > 0 ? Math.round((event.soldTickets / event.totalTickets) * 100) : 0;
  const st = STATUS_MAP[event.status];

  return (
    <div className="bg-white rounded-2xl p-5 transition-all hover:shadow-sm" style={{ border: '1px solid #ddd6fe' }}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0" style={{ background: '#7c3aed' }}>
          {event.name[0]}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3
                  className="font-black text-base cursor-pointer hover:underline"
                  style={{ color: '#1a1a2e' }}
                  onClick={() => onNavigate(event._id)}
                >
                  {event.name}
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: '#9b8fb0' }}>
                <span className="flex items-center gap-1"><Calendar size={11} />{event.date} · {event.time}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{event.venue}</span>
              </div>
            </div>

            {/* Action menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                style={{ color: '#9b8fb0' }}
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-44 rounded-xl py-1.5 z-20"
                  style={{ background: '#fff', border: '1px solid #ddd6fe', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                >
                  {[
                    { icon: BarChart2, label: 'דאשבורד', action: () => onNavigate(`${event._id}/dashboard`) },
                    { icon: Eye, label: 'צפייה בדף מכירה', action: () => window.open('/', '_blank') },
                    { icon: Copy, label: 'שכפל אירוע', action: () => onDuplicate(event._id) },
                    { icon: Pause, label: event.status === 'paused' ? 'הפעל' : 'השהה', action: () => onStatusChange(event._id, event.status === 'paused' ? 'active' : 'paused') },
                    { icon: Archive, label: 'ארכיון', action: () => onStatusChange(event._id, 'archived') },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                      style={{ color: '#1a1a2e' }}
                    >
                      <Icon size={14} style={{ color: '#9b8fb0' }} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: '#faf8ff' }}>
              <p className="text-sm font-black" style={{ color: '#7c3aed' }}>{event.soldTickets.toLocaleString()}</p>
              <p className="text-xs" style={{ color: '#9b8fb0' }}>נמכרו</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: '#faf8ff' }}>
              <p className="text-sm font-black" style={{ color: '#1a1a2e' }}>₪{(event.revenue / 1000).toFixed(0)}K</p>
              <p className="text-xs" style={{ color: '#9b8fb0' }}>הכנסה</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: '#faf8ff' }}>
              <p className="text-sm font-black" style={{ color: '#1a1a2e' }}>{event.totalTickets - event.soldTickets}</p>
              <p className="text-xs" style={{ color: '#9b8fb0' }}>נותרו</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
              <span className="flex items-center gap-1"><Ticket size={10} /> {pct}% נמכרו</span>
              <span>{event.soldTickets} / {event.totalTickets}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: pct > 80 ? '#e94560' : pct > 50 ? '#f59e0b' : '#7c3aed' }}
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: 'עריכה', to: event._id },
              { label: 'כרטיסים', to: `${event._id}/tickets` },
              { label: 'עסקאות', to: `${event._id}/transactions` },
              { label: 'קופה', to: `${event._id}/pos` },
            ].map(({ label, to }) => (
              <button
                key={label}
                onClick={() => onNavigate(to)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{ background: '#f3f0ff', color: '#7c3aed' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const eventsData = useQuery(api.events.list);
  const isLoading = eventsData === undefined;
  const events: OrganizerEvent[] = eventsData ?? [];
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);

  const filtered = events.filter(e => {
    const matchFilter = filter === 'all' || e.status === filter;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts: Record<string, number> = {
    all: events.length,
    active: events.filter(e => e.status === 'active').length,
    draft: events.filter(e => e.status === 'draft').length,
    paused: events.filter(e => e.status === 'paused').length,
    archived: events.filter(e => e.status === 'archived').length,
  };

  const handleDuplicate = async (id: Id<'events'>) => {
    const src = events.find(e => e._id === id);
    if (!src) return;
    const newId = await createEvent({
      name: `${src.name} (עותק)`,
      date: src.date,
      time: src.time,
      venue: src.venue,
      category: src.category,
      description: src.description,
      status: 'draft',
      totalTickets: src.totalTickets,
    });
    navigate(`/organizer/events/${newId}`);
  };

  const handleStatusChange = async (id: Id<'events'>, status: OrganizerEvent['status']) => {
    await updateEvent({ id, status });
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>האירועים שלי</h1>
          <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>{isLoading ? 'טוען...' : `${events.length} אירועים בסך הכול`}</p>
        </div>
        <button
          onClick={() => navigate('/organizer/events/new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all"
          style={{ background: '#ffd433', color: '#1a1a2e' }}
        >
          <Plus size={16} />
          אירוע חדש
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1" style={{ background: '#fff', border: '1px solid #ddd6fe' }}>
          <Search size={15} style={{ color: '#9b8fb0' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם אירוע, מיקום..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: '#1a1a2e' }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: '#fff', border: '1px solid #ddd6fe' }}>
          <Filter size={14} className="mx-2" style={{ color: '#9b8fb0' }} />
          {([['all', 'הכל'], ['active', 'פעילים'], ['draft', 'טיוטות'], ['paused', 'מושהים']] as [Filter, string][]).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={filter === val ? { background: '#7c3aed', color: '#fff' } : { color: '#9b8fb0' }}
            >
              {lbl} {counts[val] > 0 && <span className="ml-0.5 opacity-70">({counts[val]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #ddd6fe' }}>
            <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
            <p className="font-bold" style={{ color: '#6b5a8a' }}>טוען אירועים...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #ddd6fe' }}>
            <Calendar size={40} className="mx-auto mb-4" style={{ color: '#ddd6fe' }} />
            <p className="font-bold" style={{ color: '#6b5a8a' }}>לא נמצאו אירועים</p>
            <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>נסה לשנות את הפילטרים או צור אירוע חדש</p>
          </div>
        ) : (
          filtered.map(ev => (
            <EventRow
              key={ev._id}
              event={ev}
              onNavigate={(path) => navigate(`/organizer/events/${path}`)}
              onDuplicate={handleDuplicate}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
