import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowRight, Calendar, MapPin, FileText, Image, Tag, Globe, Settings2 } from 'lucide-react';
import { mockEvents } from '../../data/organizer';

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

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const existing = isNew ? null : mockEvents.find(e => e.id === id);

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    date: existing?.date ?? '',
    time: existing?.time ?? '',
    venue: existing?.venue ?? '',
    category: existing?.category ?? 'מוזיקה',
    description: existing?.description ?? '',
    status: existing?.status ?? 'draft',
    seoTitle: '',
    seoDesc: '',
    fbPixel: '',
    gaId: '',
    cancelPolicy: 'לא ניתן לבטל עסקה לאחר הרכישה',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (isNew) navigate('/organizer/events');
  };

  const TABS = [
    { id: 'details', label: 'פרטי האירוע' },
    { id: 'tickets', label: 'כרטיסים', path: 'tickets' },
    { id: 'lectures', label: 'הרצאות', path: 'lectures' },
    { id: 'transactions', label: 'עסקאות', path: 'transactions' },
    { id: 'dashboard', label: 'דאשבורד', path: 'dashboard' },
    { id: 'pos', label: 'קופה', path: 'pos' },
  ];

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
            {form.status === 'active' ? 'פעיל' : form.status === 'draft' ? 'טיוטה' : 'מושהה'}
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

      <div className="space-y-4">
        {/* Basic info */}
        <SectionCard icon={FileText} title="פרטים בסיסיים">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שם האירוע *</label>
              <input value={form.name} onChange={set('name')} style={inputBase} placeholder="פסטיבל הקיץ בבריכת הסולטן" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>תאריך *</label>
              <div className="relative">
                <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: '#9b8fb0' }} />
                <input type="date" value={form.date} onChange={set('date')} style={{ ...inputBase, paddingRight: '32px' }} dir="ltr" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שעה *</label>
              <input type="time" value={form.time} onChange={set('time')} style={inputBase} dir="ltr" />
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
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ddd6fe', height: '140px', background: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-center">
                <MapPin size={24} style={{ color: '#9b8fb0', margin: '0 auto 8px' }} />
                <p className="text-xs" style={{ color: '#9b8fb0' }}>אינטגרציה Google Maps</p>
                <p className="text-xs mt-0.5" style={{ color: '#b8a9d0' }}>הזן כתובת כדי לטעון מפה</p>
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
            onClick={() => {}}
          >
            <Image size={32} className="mb-3" style={{ color: '#c0dde5' }} />
            <p className="font-semibold text-sm" style={{ color: '#6b5a8a' }}>גרור תמונה לכאן או לחץ להעלאה</p>
            <p className="text-xs mt-1" style={{ color: '#9b8fb0' }}>PNG, JPG עד 5MB · מינימום 1200×628</p>
            <button className="mt-4 px-5 py-2 rounded-full text-xs font-bold" style={{ background: '#f3f0ff', color: '#7c3aed' }}>
              בחר קובץ
            </button>
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

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2 pb-6">
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
            {saved ? 'נשמר!' : 'שמור אירוע'}
          </button>
        </div>
      </div>
    </div>
  );
}
