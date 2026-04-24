import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Plus, BookOpen, MapPin, Clock, Users,
  Edit3, Trash2, Download, Send, X, Save, MessageSquare,
  Mail, Smartphone,
} from 'lucide-react';
import { mockLectures, mockEvents, type Lecture } from '../../data/organizer';

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#faf8ff',
  border: '1.5px solid #ddd6fe',
  borderRadius: '12px',
  padding: '10px 14px',
  color: '#1a1a2e',
  outline: 'none',
  fontSize: '14px',
};

function occupancyColor(pct: number) {
  if (pct >= 100) return { bar: '#b91c1c', text: '#b91c1c', bg: '#fee2e2' };
  if (pct >= 80) return { bar: '#d97706', text: '#b45309', bg: '#fef3c7' };
  return { bar: '#7c3aed', text: '#5b21b6', bg: '#ede9fe' };
}

function OccupancyBar({ registrations, maxCapacity }: { registrations: number; maxCapacity: number }) {
  const pct = Math.min(Math.round((registrations / maxCapacity) * 100), 100);
  const colors = occupancyColor(pct);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9b8fb0' }}>
        <span>{registrations.toLocaleString()} / {maxCapacity.toLocaleString()}</span>
        <span className="font-bold" style={{ color: colors.text }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors.bar }} />
      </div>
      {pct >= 100 && (
        <p className="text-xs mt-1 font-bold" style={{ color: '#b91c1c' }}>מלא לחלוטין</p>
      )}
    </div>
  );
}

function groupBySlot(lectures: Lecture[]) {
  const map = new Map<string, Lecture[]>();
  for (const l of lectures) {
    const key = `${l.startTime}–${l.endTime}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(l);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function exportLectureAttendees(lecture: Lecture) {
  const headers = ['הרצאה', 'מרצה', 'מיקום', 'שעה', 'מספר רשומים'];
  const rows = Array.from({ length: Math.min(lecture.registrations, 5) }, (_, i) => [
    lecture.title, lecture.speaker, lecture.location,
    `${lecture.startTime}–${lecture.endTime}`,
    `משתתף_${i + 1}@example.com`,
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${c}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `משתתפים-${lecture.title}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface LectureFormState {
  title: string; speaker: string; location: string;
  startTime: string; endTime: string; maxCapacity: string;
  description: string; track: string;
}

const EMPTY_FORM: LectureFormState = {
  title: '', speaker: '', location: '', startTime: '', endTime: '',
  maxCapacity: '100', description: '', track: '',
};

interface MessagingModalProps {
  lecture: Lecture;
  onClose: () => void;
}

function MessagingModal({ lecture, onClose }: MessagingModalProps) {
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [message, setMessage] = useState(`שלום, תזכורת: ההרצאה "${lecture.title}" עם ${lecture.speaker} מתחילה ב-${lecture.startTime} ב${lecture.location}.`);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" style={{ border: '1px solid #ddd6fe', direction: 'rtl' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black" style={{ color: '#1a1a2e' }}>שלח הודעה לנרשמים</h3>
            <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{lecture.registrations.toLocaleString()} נמענים · {lecture.title}</p>
          </div>
          <button onClick={onClose} style={{ color: '#9b8fb0' }}><X size={18} /></button>
        </div>

        <div className="flex gap-2 mb-4">
          {([['email', 'אימייל', Mail], ['sms', 'SMS', Smartphone]] as const).map(([ch, label, Icon]) => (
            <button key={ch} onClick={() => setChannel(ch)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={channel === ch ? { background: '#7c3aed', color: '#fff' } : { background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          style={{ ...inputBase, resize: 'vertical' }}
          placeholder="תוכן ההודעה..."
        />
        <p className="text-xs text-left mt-1" style={{ color: '#9b8fb0' }}>{message.length} תווים</p>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm font-bold" style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}>ביטול</button>
          <button
            onClick={handleSend}
            disabled={!message || sending}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-full font-black text-sm"
            style={sent ? { background: '#dcfce7', color: '#15803d' } : sending ? { background: '#ddd6fe', color: '#9b8fb0' } : { background: '#ffd433', color: '#1a1a2e' }}
          >
            {sent ? 'נשלח!' : sending ? (
              <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> שולח...</>
            ) : (
              <><Send size={14} /> שלח ל-{lecture.registrations.toLocaleString()} נמענים</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LecturesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find(e => e.id === id);

  const [lectures, setLectures] = useState<Lecture[]>(
    mockLectures.filter(l => l.eventId === id),
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [messagingLecture, setMessagingLecture] = useState<Lecture | null>(null);
  const [form, setForm] = useState<LectureFormState>(EMPTY_FORM);

  const slots = groupBySlot(lectures);

  const totalRegistrations = lectures.reduce((s, l) => s + l.registrations, 0);
  const totalCapacity = lectures.reduce((s, l) => s + l.maxCapacity, 0);
  const soldOutCount = lectures.filter(l => l.registrations >= l.maxCapacity).length;
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  const openAdd = () => {
    setEditingLecture(null);
    setForm(EMPTY_FORM);
    setShowAddModal(true);
  };

  const openEdit = (lec: Lecture) => {
    setEditingLecture(lec);
    setForm({
      title: lec.title, speaker: lec.speaker, location: lec.location,
      startTime: lec.startTime, endTime: lec.endTime,
      maxCapacity: String(lec.maxCapacity),
      description: lec.description ?? '', track: lec.track ?? '',
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (editingLecture) {
      setLectures(ls => ls.map(l => l.id === editingLecture.id ? {
        ...l, ...form, maxCapacity: +form.maxCapacity,
      } : l));
    } else {
      const newLec: Lecture = {
        id: `lec${Date.now()}`, eventId: id!, registrations: 0,
        ...form, maxCapacity: +form.maxCapacity,
      };
      setLectures(ls => [...ls, newLec]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (lecId: string) => {
    setLectures(ls => ls.filter(l => l.id !== lecId));
  };

  const exportAll = () => {
    const headers = ['הרצאה', 'מרצה', 'מיקום', 'התחלה', 'סיום', 'קיבולת', 'נרשמו', 'תפוסה%', 'סטטוס'];
    const rows = lectures.map(l => {
      const pct = Math.round((l.registrations / l.maxCapacity) * 100);
      return [l.title, l.speaker, l.location, l.startTime, l.endTime,
        l.maxCapacity, l.registrations, `${pct}%`,
        pct >= 100 ? 'מלא' : 'פנוי'];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `הרצאות-${event?.name ?? id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFormValid = form.title && form.speaker && form.location && form.startTime && form.endTime && form.maxCapacity;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate(`/organizer/events/${id}`)} className="flex items-center gap-1 text-sm font-medium hover:opacity-70" style={{ color: '#7c3aed' }}>
          <ArrowRight size={15} />
          {event?.name ?? 'אירוע'}
        </button>
        <span style={{ color: '#ddd6fe' }}>/</span>
        <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>הרצאות ומפגשים</h1>
        <div className="mr-auto flex gap-2">
          <button onClick={exportAll} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold hover:opacity-80 transition-opacity" style={{ background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}>
            <Download size={13} /> ייצוא CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-all" style={{ background: '#ffd433', color: '#1a1a2e' }}>
            <Plus size={13} /> הרצאה חדשה
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'הרצאות', value: lectures.length.toString(), color: '#7c3aed' },
          { label: 'סה"כ רשומים', value: totalRegistrations.toLocaleString(), color: '#1a1a2e' },
          { label: 'תפוסה ממוצעת', value: `${avgOccupancy}%`, color: avgOccupancy >= 80 ? '#d97706' : '#15803d' },
          { label: 'הרצאות מלאות', value: soldOutCount.toString(), color: soldOutCount > 0 ? '#b91c1c' : '#64748b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl px-4 py-3 text-center" style={{ border: '1px solid #ddd6fe' }}>
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Lecture list by slot */}
      {lectures.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #ddd6fe' }}>
          <BookOpen size={40} className="mx-auto mb-3" style={{ color: '#ddd6fe' }} />
          <p className="font-bold" style={{ color: '#9b8fb0' }}>אין הרצאות עדיין</p>
          <button onClick={openAdd} className="mt-4 px-5 py-2 rounded-full text-sm font-bold" style={{ background: '#ffd433', color: '#1a1a2e' }}>
            הוסף הרצאה ראשונה
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {slots.map(([slotKey, slotLectures]) => (
            <div key={slotKey}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} style={{ color: '#7c3aed' }} />
                <h2 className="font-black text-sm" style={{ color: '#1a1a2e' }}>{slotKey}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f3f0ff', color: '#7c3aed' }}>
                  {slotLectures.length} הרצאות
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {slotLectures.map(lec => {
                  const pct = Math.round((lec.registrations / lec.maxCapacity) * 100);
                  const colors = occupancyColor(pct);
                  return (
                    <div key={lec.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className="font-black text-sm leading-snug" style={{ color: '#1a1a2e' }}>{lec.title}</h3>
                            {lec.track && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold" style={{ background: '#f3f0ff', color: '#7c3aed' }}>{lec.track}</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold" style={{ color: '#6b5a8a' }}>{lec.speaker}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-bold shrink-0" style={{ background: colors.bg, color: colors.text }}>
                          {pct >= 100 ? 'מלא' : `${pct}%`}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-1.5 mb-3">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9b8fb0' }}>
                          <MapPin size={11} style={{ color: '#a78bfa' }} />{lec.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9b8fb0' }}>
                          <Clock size={11} style={{ color: '#a78bfa' }} />{lec.startTime} – {lec.endTime}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9b8fb0' }}>
                          <Users size={11} style={{ color: '#a78bfa' }} />
                          {lec.registrations} / {lec.maxCapacity} · נותרו {Math.max(0, lec.maxCapacity - lec.registrations)}
                        </span>
                      </div>

                      <OccupancyBar registrations={lec.registrations} maxCapacity={lec.maxCapacity} />

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #f3f0ff' }}>
                        <button
                          onClick={() => setMessagingLecture(lec)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: '#ede9fe', color: '#7c3aed' }}
                        >
                          <MessageSquare size={12} /> שלח הודעה
                        </button>
                        <button
                          onClick={() => exportLectureAttendees(lec)}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => openEdit(lec)}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(lec.id)}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-red-50"
                          style={{ color: '#e94560', border: '1px solid #fecaca' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90dvh] overflow-y-auto" style={{ border: '1px solid #ddd6fe', direction: 'rtl' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>
                {editingLecture ? 'עריכת הרצאה' : 'הרצאה חדשה'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: '#9b8fb0' }}><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>כותרת ההרצאה *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputBase} placeholder="שם ההרצאה" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מרצה *</label>
                  <input value={form.speaker} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} style={inputBase} placeholder="שם המרצה" />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מיקום *</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={inputBase} placeholder="אמפיתאטרון" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>שעת התחלה *</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputBase} dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>שעת סיום *</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inputBase} dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>קיבולת *</label>
                  <input type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))} style={inputBase} min="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>מסלול / קטגוריה</label>
                  <input value={form.track} onChange={e => setForm(f => ({ ...f, track: e.target.value }))} style={inputBase} placeholder="מוזיקה, אמנות..." />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#6b5a8a' }}>תיאור קצר</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputBase} placeholder="תיאור קצר..." />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-full text-sm font-bold" style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}>ביטול</button>
              <button
                onClick={handleSave}
                disabled={!isFormValid}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold"
                style={isFormValid ? { background: '#ffd433', color: '#1a1a2e' } : { background: '#f3f0ff', color: '#c4b5fd', cursor: 'not-allowed' }}
              >
                <Save size={14} /> שמור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messaging modal */}
      {messagingLecture && (
        <MessagingModal lecture={messagingLecture} onClose={() => setMessagingLecture(null)} />
      )}
    </div>
  );
}
