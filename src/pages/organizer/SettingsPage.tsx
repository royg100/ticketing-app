import { useState } from 'react';
import { Building, CreditCard, Bell, Globe, Save, Upload } from 'lucide-react';

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
        <Icon size={16} style={{ color: '#7c3aed' }} />{title}
      </h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    accountName: 'בריכת הסולטן פסטיבלים',
    email: 'admin@sultan.co.il',
    phone: '02-5555555',
    website: 'https://sultan-festival.co.il',
    minTicketPrice: '30',
    serviceFeePct: '5',
    currency: 'ILS',
    notifyEmail: true,
    notifyWhatsapp: true,
    notifySms: false,
    language: 'he',
  });

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(p => ({ ...p, [f]: val }));
  };

  const save = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>הגדרות חשבון</h1>
          <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>נהל את פרטי החשבון שלך</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
          style={saved ? { background: '#dcfce7', color: '#15803d' } : { background: '#ffd433', color: '#1a1a2e' }}>
          <Save size={14} />{saved ? 'נשמר!' : 'שמור שינויים'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Account info */}
        <SectionCard icon={Building} title="פרטי החשבון">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo upload */}
            <div className="md:col-span-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0" style={{ background: '#7c3aed' }}>בה</div>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: '#1a1a2e' }}>לוגו החשבון</p>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: '#f3f0ff', color: '#7c3aed' }}>
                  <Upload size={12} /> העלה לוגו
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שם החשבון</label>
              <input value={form.accountName} onChange={set('accountName')} style={inputBase} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>אימייל ראשי</label>
              <input type="email" value={form.email} onChange={set('email')} style={inputBase} dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>טלפון</label>
              <input type="tel" value={form.phone} onChange={set('phone')} style={inputBase} dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>אתר אינטרנט</label>
              <input type="url" value={form.website} onChange={set('website')} style={inputBase} dir="ltr" />
            </div>
          </div>
        </SectionCard>

        {/* Billing */}
        <SectionCard icon={CreditCard} title="הגדרות תמחור וסליקה">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>מחיר מינימלי לכרטיס (₪)</label>
              <input type="number" value={form.minTicketPrice} onChange={set('minTicketPrice')} style={inputBase} min="0" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>עמלת שירות (%)</label>
              <input type="number" value={form.serviceFeePct} onChange={set('serviceFeePct')} style={inputBase} min="0" max="100" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>מטבע</label>
              <select value={form.currency} onChange={set('currency')} style={inputBase}>
                <option value="ILS">₪ שקל ישראלי</option>
                <option value="USD">$ דולר</option>
                <option value="EUR">€ יורו</option>
              </select>
            </div>
          </div>
          <div className="mt-4 rounded-xl px-4 py-3" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <p className="text-xs font-bold" style={{ color: '#92400e' }}>🔐 סליקה (Stripe)</p>
            <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
              התשלום בדף הקנייה מועבר ל-Stripe. מפתח סודי ו-URL ו-webhook מוגדרים ב-Convex (Environment), לא כאן.
            </p>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={Bell} title="התראות">
          <div className="space-y-3">
            {[
              { f: 'notifyEmail', label: 'התראות אימייל', sub: 'קבל אימייל על כל רכישה חדשה' },
              { f: 'notifyWhatsapp', label: 'התראות WhatsApp', sub: 'הודעה ל-WhatsApp על כל עסקה' },
              { f: 'notifySms', label: 'התראות SMS', sub: 'SMS על כל עסקה (עלות נוספת)' },
            ].map(({ f, label, sub }) => (
              <label key={f} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer" style={{ border: '1px solid #ddd6fe' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{label}</p>
                  <p className="text-xs" style={{ color: '#9b8fb0' }}>{sub}</p>
                </div>
                <input type="checkbox" checked={form[f as keyof typeof form] as boolean} onChange={set(f as keyof typeof form)}
                  className="w-4 h-4" style={{ accentColor: '#7c3aed' }} />
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Language */}
        <SectionCard icon={Globe} title="שפה ואזור">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שפת ממשק</label>
              <select value={form.language} onChange={set('language')} style={inputBase}>
                <option value="he">עברית</option>
                <option value="en">English</option>
                <option value="ar">عربية</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>אזור זמן</label>
              <select style={inputBase}>
                <option>Asia/Jerusalem (GMT+3)</option>
              </select>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
