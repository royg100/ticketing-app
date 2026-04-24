import { useState } from 'react';
import { X, MapPin, Clock, Users, CheckCircle, BookOpen } from 'lucide-react';
import { mockLectures, type Lecture, type SelectedLecture } from '../data/organizer';

interface TimeSlot {
  key: string;
  label: string;
  lectures: Lecture[];
}

function groupBySlot(lectures: Lecture[]): TimeSlot[] {
  const map = new Map<string, Lecture[]>();
  for (const lec of lectures) {
    const key = `${lec.startTime}–${lec.endTime}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(lec);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, lectures]) => ({ key, label: key, lectures }));
}

function OccupancyBar({ registrations, maxCapacity }: { registrations: number; maxCapacity: number }) {
  const pct = Math.round((registrations / maxCapacity) * 100);
  const color = pct >= 100 ? '#b91c1c' : pct >= 80 ? '#d97706' : '#7c3aed';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1" style={{ color: '#9b8fb0' }}>
        <span>{registrations.toLocaleString()} / {maxCapacity.toLocaleString()} רשומים</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

interface LectureCardProps {
  lecture: Lecture;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

function LectureCard({ lecture, selected, onSelect, disabled }: LectureCardProps) {
  const isSoldOut = lecture.registrations >= lecture.maxCapacity;
  const isDisabled = disabled || isSoldOut;

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className="w-full text-right rounded-2xl p-4 transition-all"
      style={{
        border: selected ? '2px solid #7c3aed' : '1.5px solid #ddd6fe',
        background: selected ? '#f5f3ff' : isSoldOut ? '#f8f8f8' : '#fff',
        opacity: isSoldOut && !selected ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Radio indicator */}
        <div className="mt-0.5 shrink-0">
          {selected ? (
            <CheckCircle size={18} style={{ color: '#7c3aed' }} />
          ) : (
            <div className="w-4.5 h-4.5 rounded-full border-2 mt-0.5" style={{ borderColor: isSoldOut ? '#d1d5db' : '#ddd6fe', width: 18, height: 18 }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-black text-sm leading-snug" style={{ color: isSoldOut ? '#9ca3af' : '#1a1a2e' }}>
              {lecture.title}
            </p>
            {isSoldOut && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                מלא
              </span>
            )}
            {lecture.track && !isSoldOut && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                {lecture.track}
              </span>
            )}
          </div>

          <p className="text-sm mt-0.5 font-semibold" style={{ color: '#6b5a8a' }}>{lecture.speaker}</p>

          {lecture.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: '#9b8fb0' }}>{lecture.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs" style={{ color: '#9b8fb0' }}>
              <MapPin size={11} style={{ color: '#a78bfa' }} />
              {lecture.location}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: '#9b8fb0' }}>
              <Users size={11} style={{ color: '#a78bfa' }} />
              נותרו {Math.max(0, lecture.maxCapacity - lecture.registrations)}
            </span>
          </div>

          <OccupancyBar registrations={lecture.registrations} maxCapacity={lecture.maxCapacity} />
        </div>
      </div>
    </button>
  );
}

interface Props {
  eventId?: string;
  initialSelections: SelectedLecture[];
  onConfirm: (selections: SelectedLecture[]) => void;
  onClose: () => void;
}

export default function LectureSelectionModal({ eventId = 'ev1', initialSelections, onConfirm, onClose }: Props) {
  const lectures = mockLectures.filter(l => l.eventId === eventId);
  const slots = groupBySlot(lectures);

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const sel of initialSelections) init[sel.slotKey] = sel.lectureId;
    return init;
  });

  const selectLecture = (slotKey: string, lectureId: string) => {
    setSelections(prev => {
      if (prev[slotKey] === lectureId) {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      }
      return { ...prev, [slotKey]: lectureId };
    });
  };

  const handleConfirm = () => {
    const result: SelectedLecture[] = Object.entries(selections).map(([slotKey, lectureId]) => ({
      slotKey,
      lectureId,
    }));
    onConfirm(result);
    onClose();
  };

  const selectedCount = Object.keys(selections).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl flex flex-col"
        style={{
          maxHeight: '92dvh',
          borderRadius: '20px 20px 0 0',
          border: '1px solid #ddd6fe',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between shrink-0" style={{ borderBottom: '1px solid #f3f0ff' }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <BookOpen size={18} style={{ color: '#7c3aed' }} />
              <h2 className="font-black text-lg" style={{ color: '#1a1a2e' }}>בחירת הרצאות</h2>
            </div>
            <p className="text-sm" style={{ color: '#9b8fb0' }}>
              בחר הרצאה אחת לכל חלון זמן (אופציונלי)
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#9b8fb0' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scroll body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6" style={{ direction: 'rtl' }}>
          {slots.map(slot => (
            <div key={slot.key}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} style={{ color: '#7c3aed' }} />
                <h3 className="font-black text-sm" style={{ color: '#1a1a2e' }}>{slot.label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f3f0ff', color: '#7c3aed' }}>
                  {slot.lectures.length} הרצאות
                </span>
                {selections[slot.key] && (
                  <span className="text-xs flex items-center gap-1 mr-auto" style={{ color: '#15803d' }}>
                    <CheckCircle size={12} />
                    נבחר
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {slot.lectures.map(lec => (
                  <LectureCard
                    key={lec.id}
                    lecture={lec}
                    selected={selections[slot.key] === lec.id}
                    onSelect={() => selectLecture(slot.key, lec.id)}
                    disabled={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #f3f0ff' }}>
          {selectedCount > 0 && (
            <p className="text-xs text-center mb-3" style={{ color: '#9b8fb0' }}>
              נבחרו {selectedCount} מתוך {slots.length} חלונות זמן
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-sm font-bold"
              style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}
            >
              דלג
            </button>
            <button
              onClick={handleConfirm}
              className="flex-[2] py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: '#ffd433', color: '#1a1a2e' }}
            >
              <CheckCircle size={15} />
              {selectedCount > 0 ? `אישור – ${selectedCount} הרצאות` : 'המשך ללא הרצאות'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
