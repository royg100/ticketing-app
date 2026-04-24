import { useState } from 'react';
import { Users, Plus, Mail, Shield, Eye, ShoppingBag, Trash2, X, Save } from 'lucide-react';

type Role = 'admin' | 'cashier' | 'organizer' | 'viewer';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'pending';
  joinedAt: string;
}

const ROLES: Record<Role, { label: string; color: string; bg: string; icon: React.ElementType; perms: string[] }> = {
  admin: { label: 'מנהל', color: '#b91c1c', bg: '#fee2e2', icon: Shield, perms: ['גישה מלאה לכל המודולים', 'ניהול צוות', 'הגדרות חשבון'] },
  organizer: { label: 'מארגן', color: '#1d4ed8', bg: '#dbeafe', icon: Users, perms: ['יצירת ועריכת אירועים', 'ניהול כרטיסים', 'הנפקה ידנית'] },
  cashier: { label: 'קופאי', color: '#b45309', bg: '#fef9c3', icon: ShoppingBag, perms: ['גישה לקופה (POS)', 'סריקת QR', 'רשימת כניסות'] },
  viewer: { label: 'צופה', color: '#64748b', bg: '#f1f5f9', icon: Eye, perms: ['צפייה בדוחות', 'צפייה ברשימות', 'ללא עריכה'] },
};

const mockMembers: Member[] = [
  { id: 'm1', name: 'ישראל ישראלי', email: 'israel@sultan.co.il', role: 'admin', status: 'active', joinedAt: '1 ינואר 2025' },
  { id: 'm2', name: 'שרה כהן', email: 'sarah@sultan.co.il', role: 'organizer', status: 'active', joinedAt: '15 מרץ 2025' },
  { id: 'm3', name: 'משה לוי', email: 'moshe@sultan.co.il', role: 'cashier', status: 'active', joinedAt: '1 אפריל 2025' },
  { id: 'm4', name: 'חנה ביטון', email: 'hana@gmail.com', role: 'viewer', status: 'pending', joinedAt: 'הוזמן' },
];

export default function TeamPage() {
  const [members, setMembers] = useState(mockMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('organizer');

  const invite = () => {
    if (!inviteEmail) return;
    const m: Member = {
      id: `m${Date.now()}`, name: inviteEmail.split('@')[0], email: inviteEmail,
      role: inviteRole, status: 'pending', joinedAt: 'הוזמן',
    };
    setMembers(ms => [...ms, m]);
    setShowInvite(false);
    setInviteEmail('');
  };

  const remove = (id: string) => setMembers(ms => ms.filter(m => m.id !== id));

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>ניהול צוות</h1>
          <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>{members.length} חברי צוות</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all" style={{ background: '#ffd433', color: '#1a1a2e' }}>
          <Plus size={15} /> הזמן חבר צוות
        </button>
      </div>

      {/* Roles overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {(Object.entries(ROLES) as [Role, typeof ROLES[Role]][]).map(([role, cfg]) => {
          const Icon = cfg.icon;
          const count = members.filter(m => m.role === role).length;
          return (
            <div key={role} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #ddd6fe' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon size={14} />
                </div>
                <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{cfg.label}</p>
              </div>
              <p className="text-2xl font-black" style={{ color: cfg.color }}>{count}</p>
              <div className="mt-2 space-y-0.5">
                {cfg.perms.map(p => (
                  <p key={p} className="text-xs" style={{ color: '#9b8fb0' }}>· {p}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Members list */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd6fe' }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f3f0ff' }}>
          <Users size={15} style={{ color: '#7c3aed' }} />
          <h2 className="font-black" style={{ color: '#1a1a2e' }}>חברי הצוות</h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#f3f0ff' }}>
          {members.map(m => {
            const roleCfg = ROLES[m.role];
            const RoleIcon = roleCfg.icon;
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0" style={{ background: roleCfg.color }}>
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{m.name}</p>
                    {m.status === 'pending' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#fef9c3', color: '#a16207' }}>ממתין</span>
                    )}
                  </div>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#9b8fb0' }}>
                    <Mail size={10} />{m.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: roleCfg.bg, color: roleCfg.color }}>
                    <RoleIcon size={11} />{roleCfg.label}
                  </span>
                  <select
                    value={m.role}
                    onChange={e => setMembers(ms => ms.map(mem => mem.id === m.id ? { ...mem, role: e.target.value as Role } : mem))}
                    className="text-xs rounded-lg px-2 py-1.5 hidden sm:block"
                    style={{ border: '1px solid #ddd6fe', color: '#6b5a8a' }}
                  >
                    {(Object.entries(ROLES) as [Role, typeof ROLES[Role]][]).map(([r, rc]) => (
                      <option key={r} value={r}>{rc.label}</option>
                    ))}
                  </select>
                  <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#e94560' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" style={{ border: '1px solid #ddd6fe' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black" style={{ color: '#1a1a2e' }}>הזמן חבר צוות</h2>
              <button onClick={() => setShowInvite(false)} style={{ color: '#9b8fb0' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6b5a8a' }}>כתובת אימייל</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} dir="ltr"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: '#faf8ff', border: '1.5px solid #ddd6fe', color: '#1a1a2e' }}
                  placeholder="colleague@company.com" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: '#6b5a8a' }}>תפקיד</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(ROLES) as [Role, typeof ROLES[Role]][]).map(([role, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={role} onClick={() => setInviteRole(role)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition-all"
                        style={inviteRole === role ? { background: cfg.bg, color: cfg.color, border: `2px solid ${cfg.color}40` } : { border: '1.5px solid #ddd6fe', color: '#9b8fb0' }}>
                        <Icon size={15} />{cfg.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 rounded-xl px-3 py-2" style={{ background: '#faf8ff' }}>
                  {ROLES[inviteRole].perms.map(p => <p key={p} className="text-xs" style={{ color: '#6b5a8a' }}>· {p}</p>)}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2.5 rounded-full text-sm font-bold" style={{ border: '1.5px solid #ddd6fe', color: '#6b5a8a' }}>ביטול</button>
              <button onClick={invite} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold" style={{ background: '#ffd433', color: '#1a1a2e' }}>
                <Save size={14} /> שלח הזמנה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
