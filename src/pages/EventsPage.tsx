import { Calendar, Clock, MapPin, ChevronLeft, Music, Mic, Headphones, Music2, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { events } from '../data/events';
import type { Event } from '../types';

const GENRE_ICONS: Record<string, React.ReactNode> = {
  'רוק ישראלי': <Music size={20} />,
  "ג'אז ובלוז": <Mic size={20} />,
  'מוזיקה קלאסית': <Music2 size={20} />,
  'אלקטרוניקה': <Headphones size={20} />,
};

const GENRE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'רוק ישראלי':   { bg: '#fff3cd', text: '#7a5f00', icon: '#d4a000' },
  "ג'אז ובלוז":  { bg: '#d6eaf8', text: '#1a5276', icon: '#2e86c1' },
  'מוזיקה קלאסית': { bg: '#eaf4fb', text: '#1a6080', icon: '#2596be' },
  'אלקטרוניקה':  { bg: '#e8f8f5', text: '#1a7a5a', icon: '#1abc9c' },
};

const MIN_PRICES: Record<string, number> = {
  e1: 150, e2: 150, e3: 150, e4: 150,
};

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const availability = Math.round((event.availableSeats / event.totalSeats) * 100);
  const colors = GENRE_COLORS[event.genre] ?? { bg: '#f0f9ff', text: '#1a4a6e', icon: '#2980b9' };
  const icon = GENRE_ICONS[event.genre];
  const isLowStock = availability < 30;

  return (
    <div
      className="bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
      style={{ border: '1px solid #ddd6fe', boxShadow: '0 2px 12px rgba(0,180,204,0.07)' }}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      {/* Colored top bar */}
      <div className="h-1.5 w-full" style={{ background: colors.icon }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
            style={{ background: colors.bg, color: colors.icon }}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Genre + low stock badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: colors.bg, color: colors.text }}
              >
                {event.genre}
              </span>
              {isLowStock && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#ffe4e8', color: '#c0392b' }}>
                  מקומות אחרונים!
                </span>
              )}
            </div>

            <h3 className="font-black text-lg leading-tight" style={{ color: '#1a1a2e' }}>{event.titleHe}</h3>
            <p className="font-semibold text-sm mt-0.5" style={{ color: '#7c3aed' }}>{event.artist}</p>
            <p className="text-sm mt-1.5 leading-relaxed line-clamp-2" style={{ color: '#6b5a8a' }}>{event.description}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6b5a8a' }}>
                <Calendar size={13} className="shrink-0" style={{ color: '#7c3aed' }} />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6b5a8a' }}>
                <Clock size={13} className="shrink-0" style={{ color: '#7c3aed' }} />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6b5a8a' }}>
                <MapPin size={13} className="shrink-0" style={{ color: '#7c3aed' }} />
                <span>{event.venue}</span>
              </div>
            </div>

            {/* Availability bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
                <span>{event.availableSeats.toLocaleString()} מקומות פנויים</span>
                <span>{availability}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ddd6fe' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${availability}%`,
                    background: availability > 50 ? '#7c3aed' : availability > 20 ? '#f59e0b' : '#e94560',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs" style={{ color: '#9b8fb0' }}>החל מ</p>
              <p className="text-2xl font-black" style={{ color: '#1a1a2e' }}>₪{MIN_PRICES[event.id] ?? 150}</p>
            </div>
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: '#ffd433', color: '#1a1a2e' }}
            >
              בחר מקום
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const june15Events = events.filter(e => e.date.includes('15'));
  const june16Events = events.filter(e => e.date.includes('16'));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: '#ffffff', borderBottom: '1px solid #ddd6fe' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-30 -translate-x-1/3 -translate-y-1/3" style={{ background: '#ede9fe' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-20 translate-x-1/4 translate-y-1/4" style={{ background: '#c4b5fd' }} />

        <div className="relative max-w-4xl mx-auto px-4 py-14 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            ירושלים · יוני 2025
          </div>

          <h1 className="text-4xl font-black leading-tight" style={{ color: '#1a1a2e' }}>
            פסטיבל בריכת הסולטן
          </h1>
          <p className="mt-3 text-lg" style={{ color: '#6b5a8a' }}>
            4 הופעות מיוחדות · 2 ימים של מוזיקה · ירושלים
          </p>

          <div className="mt-8 flex justify-center gap-6 flex-wrap">
            {[
              { val: events.length.toString(), label: 'הופעות' },
              { val: '2', label: 'ימים' },
              { val: '3,500', label: 'מקומות' },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="flex flex-col items-center px-6 py-4 rounded-2xl"
                style={{ background: '#ede9fe' }}
              >
                <span className="text-3xl font-black" style={{ color: '#7c3aed' }}>{val}</span>
                <span className="text-sm mt-0.5" style={{ color: '#6b5a8a' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {june15Events.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: '#ffd433' }}>
                <Calendar size={16} style={{ color: '#1a1a2e' }} />
              </div>
              <h2 className="text-xl font-black" style={{ color: '#1a1a2e' }}>יום שישי · 15 ביוני</h2>
            </div>
            <div className="space-y-4">
              {june15Events.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          </section>
        )}

        {june16Events.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: '#ffd433' }}>
                <Calendar size={16} style={{ color: '#1a1a2e' }} />
              </div>
              <h2 className="text-xl font-black" style={{ color: '#1a1a2e' }}>יום שבת · 16 ביוני</h2>
            </div>
            <div className="space-y-4">
              {june16Events.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="border-t py-8 text-center" style={{ borderColor: '#ddd6fe', background: 'white' }}>
        <p className="text-sm" style={{ color: '#9b8fb0' }}>
          טיקסיט · מכירת כרטיסים מאובטחת · כל הזכויות שמורות
        </p>
        <a
          href="/organizer/login"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold hover:opacity-70 transition-opacity"
          style={{ color: '#7c3aed' }}
        >
          <LayoutDashboard size={12} />
          פורטל מארגנים
        </a>
      </div>
    </div>
  );
}
