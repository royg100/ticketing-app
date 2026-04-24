import { useMemo, useState, useEffect } from 'react';
import { Home, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { events as demoEvents } from '../../data/events';
import type { Doc } from '../../../convex/_generated/dataModel';

type NavItem = { id: string; name: string; date: string; group: string };

function byGroup(items: NavItem[]): { group: string; items: NavItem[] }[] {
  const m = new Map<string, NavItem[]>();
  for (const it of items) {
    if (!m.has(it.group)) m.set(it.group, []);
    m.get(it.group)!.push(it);
  }
  return Array.from(m.entries()).map(([group, list]) => ({ group, items: list }));
}

function itemsFromDb(docs: Doc<'events'>[]): NavItem[] {
  return docs.map((ev) => ({
    id: ev._id,
    name: ev.name,
    date: ev.date,
    group: ev.menuGroup?.trim() || ev.category?.trim() || 'אירועים',
  }));
}

function itemsFromDemo(): NavItem[] {
  return demoEvents.map((ev) => ({
    id: ev.id,
    name: ev.titleHe,
    date: ev.date,
    group: ev.genre,
  }));
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? 'text-white' : 'text-[#4a3f66] hover:bg-[#f5f0ff]'
  }`;

const linkStyle = (isActive: boolean) => (isActive ? { background: '#7c3aed' } : {});

/**
 * ניווט צד: "כל האירועים" + אירועים מקובצים לפי `menuGroup` (או `category` אם ריק; בדמו: ז'אנר).
 * פסטיבל עם מספר הופעות: אותו טקסט ב־"קבוצה בתפריט הלקוח" בכל אירועי הסדרה.
 */
export default function BuyerNavPanel({ onItemClick }: { onItemClick?: () => void }) {
  const active = useQuery(api.events.listByStatus, { status: 'active' });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (active !== undefined) return;
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [active]);

  const { sections, loading, empty } = useMemo(() => {
    if (active === undefined && !timedOut) {
      return { sections: [] as { group: string; items: NavItem[] }[], loading: true, empty: false };
    }
    if (active && active.length > 0) {
      return {
        sections: byGroup(itemsFromDb(active)),
        loading: false,
        empty: false,
      };
    }
    const demo = itemsFromDemo();
    return {
      sections: byGroup(demo),
      loading: false,
      empty: demo.length === 0,
    };
  }, [active, timedOut]);

  return (
    <nav className="flex flex-col h-full" aria-label="תפריט אירועים">
      <p className="px-1 mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: '#9b8fb0' }}>
        ניווט
      </p>
      <NavLink
        to="/"
        end
        onClick={onItemClick}
        className={linkClass}
        style={({ isActive }) => linkStyle(isActive)}
      >
        <span className="flex items-center gap-2">
          <Home size={16} className="shrink-0 opacity-90" />
          כל האירועים
        </span>
      </NavLink>

      {loading && (
        <p className="mt-4 text-sm px-1" style={{ color: '#9b8fb0' }}>
          טוען…
        </p>
      )}

      {!loading && !empty && (
        <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-0.5">
          {sections.map(({ group, items: groupItems }) => (
            <div key={group}>
              <p
                className="px-1 mb-1.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: '#b8a8d4' }}
              >
                {group}
              </p>
              <ul className="space-y-0.5">
                {groupItems.map((ev) => (
                  <li key={ev.id}>
                    <NavLink
                      to={`/event/${ev.id}`}
                      onClick={onItemClick}
                      className={linkClass}
                      style={({ isActive }) => linkStyle(isActive)}
                    >
                      {({ isActive }) => (
                        <span className="flex items-start gap-2">
                          <Calendar size={14} className="shrink-0 mt-0.5 opacity-80" />
                          <span className="min-w-0">
                            <span className="block leading-snug line-clamp-2">{ev.name}</span>
                            <span
                              className="block text-[11px] font-medium mt-0.5"
                              style={{ color: isActive ? 'rgba(255,255,255,0.9)' : '#9b8fb0' }}
                            >
                              {ev.date}
                            </span>
                          </span>
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
