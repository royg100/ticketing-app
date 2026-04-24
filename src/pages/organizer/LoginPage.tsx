import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#faf8ff',
  border: '1.5px solid #ddd6fe',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#1a1a2e',
  outline: 'none',
  fontSize: '14px',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    navigate('/organizer/lobby');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#faf8ff', direction: 'rtl' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg" style={{ background: '#ffd433', color: '#1a1a2e' }}>
              T
            </div>
            <span className="font-black text-2xl text-white">טיקסיט</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            מכירת כרטיסים<br />לאירועים שלך
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            פלטפורמת SaaS ישראלית למארגני אירועים — ניהול כרטיסים, סליקה, CRM ודיוור — הכול במקום אחד.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { stat: '50,000+', label: 'כרטיסים נמכרו' },
            { stat: '99.9%', label: 'זמינות המערכת' },
            { stat: '300+', label: 'מארגנים פעילים' },
          ].map(({ stat, label }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-xl font-black text-white">{stat}</span>
              <span className="text-blue-100 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black" style={{ background: '#ffd433', color: '#1a1a2e' }}>T</div>
            <span className="font-black text-xl" style={{ color: '#1a1a2e' }}>טיקסיט</span>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #ddd6fe', boxShadow: '0 4px 24px rgba(0,180,204,0.08)' }}>
            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-7" style={{ background: '#faf8ff' }}>
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={mode === m ? { background: '#fff', color: '#7c3aed', boxShadow: '0 1px 6px rgba(0,180,204,0.15)' } : { color: '#9b8fb0' }}
                >
                  {m === 'login' ? 'כניסה' : 'הרשמה'}
                </button>
              ))}
            </div>

            <h1 className="text-xl font-black mb-6" style={{ color: '#1a1a2e' }}>
              {mode === 'login' ? 'ברוכים הבאים חזרה 👋' : 'יצירת חשבון חדש'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>שם מלא</label>
                  <input required value={form.name} onChange={set('name')} style={inputBase} placeholder="ישראל ישראלי" />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>כתובת אימייל</label>
                <div className="relative">
                  <Mail size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: '#9b8fb0' }} />
                  <input required type="email" value={form.email} onChange={set('email')} style={{ ...inputBase, paddingRight: '36px' }} placeholder="name@company.co.il" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>סיסמה</label>
                <div className="relative">
                  <Lock size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: '#9b8fb0' }} />
                  <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} style={{ ...inputBase, paddingRight: '36px', paddingLeft: '36px' }} placeholder="••••••••" dir="ltr" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 -translate-y-1/2 left-3.5" style={{ color: '#9b8fb0' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="text-left">
                  <button type="button" className="text-xs font-semibold" style={{ color: '#7c3aed' }}>שכחתי סיסמה</button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={loading ? { background: '#ddd6fe', color: '#9b8fb0' } : { background: '#ffd433', color: '#1a1a2e' }}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />מתחבר...</>
                ) : mode === 'login' ? 'כניסה לחשבון' : 'יצירת חשבון'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#ddd6fe' }} />
              <span className="text-xs" style={{ color: '#9b8fb0' }}>או</span>
              <div className="flex-1 h-px" style={{ background: '#ddd6fe' }} />
            </div>

            <button
              onClick={() => { setLoading(true); setTimeout(() => navigate('/organizer/lobby'), 800); }}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a', background: '#fff' }}
            >
              <Globe size={16} />
              כניסה עם Google
            </button>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: '#9b8fb0' }}>
            בכניסה למערכת אתה מסכים ל
            <button className="font-semibold underline mx-1" style={{ color: '#7c3aed' }}>תנאי השימוש</button>
            ולמדיניות
            <button className="font-semibold underline mx-1" style={{ color: '#7c3aed' }}>הפרטיות</button>
          </p>
        </div>
      </div>
    </div>
  );
}
