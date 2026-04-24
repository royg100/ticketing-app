import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { Save, ArrowRight, Calendar, MapPin, FileText, Image, Tag, Globe, Settings2, Trash2 } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

const CATEGORIES = ['מוזיקה', "ג'אז ובלוז", 'רוק', 'קלאסי', 'תיאטרון', 'ילדים', 'ספורט', 'סיורים', 'אחר'];

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

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #ddd6fe' }}>
      <h2 className="flex items-center gap-2 font-black mb-5" style={{ color: '#1a1a2e' }}>
        <Icon size={16} style={{ color: '#7c3aed' }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

type Status = 'draft' | 'active' | 'paused' | 'archived';

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const eventId = !isNew && id ? (id as Id<'events'>) : undefined;

  const existing = useQuery(api.events.get, eventId ? { id: eventId } : 'skip');
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    category: 'מוזיקה',
    menuGroup: '',
    description: '',
    status: 'draft' as Status,
    totalTickets: 0,
    seoTitle: '',
    seoDesc: '',
    fbPixel: '',
    gaId: '',
    cancelPolicy: 'לא ניתן לבטל עסקה לאחר הרכישה',
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name ?? '',
        date: existing.date ?? '',
        time: existing.time ?? '',
        venue: existing.venue ?? '',
        category: existing.category ?? 'מוזיקה',
        menuGroup: existing.menuGroup ?? '',
        description: existing.description ?? '',
        status: existing.status,
        totalTickets: existing.totalTickets ?? 0,
        seoTitle: existing.seoTitle ?? '',
        seoDesc: existing.seoDesc ?? '',
        fbPixel: existing.fbPixel ?? '',
        gaId: existing.gaId ?? '',
        cancelPolicy: existing.cancelPolicy ?? 'לא ניתן לבטל עסקה לאחר הרכישה',
      });
    }
  }, [existing]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = f === 'totalTickets' ? Number(e.target.value) || 0 : e.target.value;
    setForm(p => ({ ...p, [f]: value }));
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) return setError('נא להזין שם אירוע');
    if (!form.date) return setError('נא להזין תאריך');
    if (!form.venue.trim()) return setError('נא להזין מיקום');

    setSaving(true);
    try {
      if (isNew) {
        const newId = await createEvent({
          name: form.name,
          date: form.date,
          time: form.time,
          venue: form.venue,
          category: form.category,
          menuGroup: form.menuGroup.trim() || undefined,
          description: form.description || undefined,
          status: form.status,
          totalTickets: form.totalTickets || undefined,
          seoTitle: form.seoTitle || undefined,
          seoDesc: form.seoDesc || undefined,
          fbPixel: form.fbPixel || undefined,
          gaId: form.gaId || undefined,
          cancelPolicy: form.cancelPolicy || undefined,
        });
        setSaved(true);
        setTimeout(() => navigate(`/organizer/events/${newId}`), 1500);
      } else if (eventId) {
        await updateEvent({
          id: eventId,
          name: form.name,
          date: form.date,
          time: form.time,
          venue: form.venue,
          category: form.category,
          menuGroup: form.menuGroup.trim(),
          description: form.description,
          status: form.status,
          totalTickets: form.totalTickets,
          seoTitle: form.seoTitle,
          seoDesc: form.seoDesc,
          fbPixel: form.fbPixel,
          gaId: form.gaId,
          cancelPolicy: form.cancelPolicy,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    if (!confirm('למחוק את האירוע וכל הנתונים הנלווים? פעולה זו אינה הפיכה.')) return;
    await removeEvent({ id: eventId });
    navigate('/organizer/events');
  };

  const TABS = [
    { id: 'details', label: 'פרטי האירוע' },
    { id: 'tickets', label: 'כרטיסים', path: 'tickets' },
    { id: 'lectures', label: 'הרצאות', path: 'lectures' },
    { id: 'transactions', label: 'עסקאות', path: 'transactions' },
    { id: 'dashboard', label: 'דאשבורד', path: 'dashboard' },
    { id: 'pos', label: 'קופה', path: 'pos' },
  ];

  if (!isNew && existing === undefined) {
    return <div className="text-center py-20" style={{ color: '#9b8fb0' }}>טוען...</div>;
  }
  if (!isNew && existing === null) {
    return <div className="text-center py-20" style={{ color: '#b91c1c' }}>האירוע לא נמצא</div>;
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate('/organizer/events')} className="flex items-center gap-1 text-sm font-medium hover:opacity-70" style={{ color: '#7c3aed' }}>
          <ArrowRight size={15} />
          אירועים
        </button>
        <span style={{ color: '#ddd6fe' }}>/</span>
        <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>
          {isNew ? 'אירוע חדש' : form.name || 'עריכת אירוע'}
        </h1>

        {!isNew && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={
              form.status === 'active' ? { background: '#dcfce7', color: '#15803d' } :
              form.status === 'draft' ? { background: '#fef9c3', color: '#a16207' } :
              { background: '#fee2e2', color: '#b91c1c' }
            }
          >
            {form.status === 'active' ? 'פעיל' : form.status === 'draft' ? 'טיוטה' : form.status === 'paused' ? 'מושהה' : 'ארכיון'}
          </span>
        )}

        <div className="mr-auto flex items-center gap-2">
          <select
            value={form.status}
            onChange={set('status')}
            className="text-xs font-semibold px-3 py-2 rounded-xl"
            style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a', background: '#fff' }}
          >
            <option value="draft">טיוטה</option>
            <option value="active">פרסם</option>
            <option value="paused">השהה</option>
            <option value="archived">ארכיון</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-all"
            style={saved ? { background: '#dcfce7', color: '#15803d' } : saving ? { background: '#ddd6fe', color: '#9b8fb0' } : { background: '#ffd433', color: '#1a1a2e' }}
          >
            <Save size={14} />
            {saved ? 'נשמר!' : saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      {/* Sub-tabs (only for existing event) */}
      {!isNew && (
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#fff', border: '1px solid #ddd6fe' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.path ? navigate(`/organizer/events/${id}/${tab.path}`) : undefined}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={tab.id === 'details' ? { background: '#7c3aed', color: '#fff' } : { color: '#9b8fb0' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: '#fee2e2', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Basic info */}
        <SectionCard icon={FileText} title="פרטים בסיסיים">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isNew && existing && (
              <>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>מזהה אירוע (eventKey)</label>
                  <input
                    readOnly
                    value={existing.eventKey ?? '— (ייווצר בשמירה הבאה)'}
                    style={{ ...inputBase, background: '#f3f0ff', cursor: 'default' }}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>מזהה Convex (_id)</label>
                  <input readOnly value={existing._id} style={{ ...inputBase, background: '#f3f0ff', cursor: 'default' }} dir="ltr" />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שם האירוע *</label>
              <input value={form.name} onChange={set('name')} style={inputBase} placeholder="פסטיבל הקיץ בבריכת הסולטן" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>תאריך *</label>
              <div className="relative">
                <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: '#9b8fb0' }} />
                <input type="text" value={form.date} onChange={set('date')} style={{ ...inputBase, paddingRight: '32px' }} placeholder="15 ביוני 2025" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שעה *</label>
              <input type="time" value={form.time} onChange={set('time')} style={inputBase} dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>סה"כ כרטיסים זמינים</label>
              <input type="number" min={0} value={form.totalTickets} onChange={set('totalTickets')} style={inputBase} placeholder="3500" />
            </div>
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard icon={MapPin} title="מיקום">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שם המקום *</label>
              <div className="relative">
                <MapPin size={14} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: '#9b8fb0' }} />
                <input value={form.venue} onChange={set('venue')} style={{ ...inputBase, paddingRight: '32px' }} placeholder="בריכת הסולטן, ירושלים" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Description + Category */}
        <SectionCard icon={Tag} title="תיאור וקטגוריה">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>קטגוריה</label>
              <select value={form.category} onChange={set('category')} style={{ ...inputBase }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>
                קבוצה בתפריט הלקוח (אופציונלי)
              </label>
              <input
                value={form.menuGroup}
                onChange={set('menuGroup')}
                style={inputBase}
                placeholder="למשל: פסטיבל ברכת הסולטן 2026"
              />
              <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: '#9b8fb0' }}>
                אותו מלל לכל הופעה תחת אותו פסטיבל — יופיעו ביחד בתפריט הצד. ריק: ממוין לפי קטגוריה בלבד.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>תיאור האירוע</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={5}
                style={{ ...inputBase, resize: 'vertical' }}
                placeholder="תאר את האירוע — מה מיוחד בו, מה הקהל יחווה, מי מופיע..."
              />
            </div>
          </div>
        </SectionCard>

        {/* Banner */}
        <SectionCard icon={Image} title="תמונת באנר">
          <div
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer hover:opacity-80 transition-all"
            style={{ borderColor: '#ddd6fe', background: '#fbfaff' }}
          >
            <Image size={32} className="mb-3" style={{ color: '#c0dde5' }} />
            <p className="font-semibold text-sm" style={{ color: '#6b5a8a' }}>גרור תמונה לכאן או לחץ להעלאה</p>
            <p className="text-xs mt-1" style={{ color: '#9b8fb0' }}>PNG, JPG עד 5MB · מינימום 1200×628</p>
          </div>
        </SectionCard>

        {/* SEO + Tracking */}
        <SectionCard icon={Globe} title="SEO ומעקב">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>כותרת SEO</label>
              <input value={form.seoTitle} onChange={set('seoTitle')} style={inputBase} placeholder="כותרת לגוגל ורשתות חברתיות" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>תיאור SEO</label>
              <textarea value={form.seoDesc} onChange={set('seoDesc')} rows={2} style={{ ...inputBase, resize: 'none' }} placeholder="תיאור קצר לתוצאות החיפוש" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>פיקסל פייסבוק</label>
              <input value={form.fbPixel} onChange={set('fbPixel')} style={inputBase} placeholder="XXXXXXXXXXXXXXXXXX" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>Google Analytics ID</label>
              <input value={form.gaId} onChange={set('gaId')} style={inputBase} placeholder="G-XXXXXXXXXX" dir="ltr" />
            </div>
          </div>
        </SectionCard>

        {/* Settings */}
        <SectionCard icon={Settings2} title="הגדרות אירוע">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>מדיניות ביטול</label>
            <textarea value={form.cancelPolicy} onChange={set('cancelPolicy')} rows={3} style={{ ...inputBase, resize: 'vertical' }} />
          </div>
        </SectionCard>

        {/* Save + delete */}
        <div className="flex justify-between gap-3 pt-2 pb-6 flex-wrap">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{ background: '#fee2e2', color: '#b91c1c' }}
            >
              <Trash2 size={14} />
              מחק אירוע
            </button>
          )}
          <div className="flex gap-3 mr-auto">
            <button onClick={() => navigate('/organizer/events')} className="px-6 py-2.5 rounded-full text-sm font-bold" style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}>
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all"
              style={saved ? { background: '#dcfce7', color: '#15803d' } : { background: '#ffd433', color: '#1a1a2e' }}
            >
              <Save size={14} />
              {saved ? 'נשמר!' : isNew ? 'צור אירוע' : 'שמור אירוע'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
