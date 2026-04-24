import { useState } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, Users, Smartphone, Mail, Plus, X } from 'lucide-react';

type Channel = 'whatsapp' | 'sms' | 'email';

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: '#25d366', bg: '#dcfce7' },
  sms: { label: 'SMS', icon: Smartphone, color: '#7c3aed', bg: '#ede9fe' },
  email: { label: 'אימייל', icon: Mail, color: '#f59e0b', bg: '#fef9c3' },
};

const TEMPLATES = [
  { name: 'תזכורת לאירוע', body: 'שלום {{שם}}, מזכירים לך שהאירוע {{שם_אירוע}} מתחיל מחר ב-{{שעה}} ב-{{מיקום}}. נתראה שם! 🎉' },
  { name: 'אישור רכישה', body: 'תודה {{שם}} על רכישת הכרטיס ל{{שם_אירוע}}! QR Code שלך נשלח אליך בנפרד.' },
  { name: 'הודעה מיוחדת', body: 'שלום {{שם}}, יש לנו בשורה מיוחדת עבורך על {{שם_אירוע}}...' },
];

interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  recipients: number;
  sent: number;
  failed: number;
  status: 'sent' | 'scheduled' | 'draft';
  sentAt: string;
}

const mockCampaigns: Campaign[] = [
  { id: 'c1', name: 'תזכורת יום לפני – פסטיבל', channel: 'whatsapp', recipients: 2690, sent: 2645, failed: 45, status: 'sent', sentAt: '14 ביוני 10:00' },
  { id: 'c2', name: 'אישור רכישה', channel: 'email', recipients: 2690, sent: 2690, failed: 0, status: 'sent', sentAt: 'שוטף' },
  { id: 'c3', name: 'תזכורת שעה לפני', channel: 'sms', recipients: 2690, sent: 0, failed: 0, status: 'scheduled', sentAt: '15 ביוני 18:00' },
];

export default function MessagingPage() {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>הודעות ודיוור</h1>
          <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>שלח הודעות המוניות לקונים שלך</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: '#ffd433', color: '#1a1a2e' }}>
          <Plus size={14} /> קמפיין חדש
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Compose */}
        <div className="space-y-4">
          {/* Channel selector */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <h2 className="font-black mb-4" style={{ color: '#1a1a2e' }}>ערוץ שליחה</h2>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(CHANNEL_CONFIG) as [Channel, typeof CHANNEL_CONFIG[Channel]][]).map(([ch, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button key={ch} onClick={() => setChannel(ch)}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all font-bold text-sm"
                    style={channel === ch ? { borderColor: cfg.color, background: cfg.bg, color: cfg.color } : { borderColor: '#ddd6fe', color: '#9b8fb0' }}>
                    <Icon size={20} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <h2 className="font-black mb-4 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
              <Users size={15} style={{ color: '#7c3aed' }} /> קהל יעד
            </h2>
            <div className="space-y-2">
              {[
                { val: 'all', label: 'כל הרוכשים', count: 2690 },
                { val: 'ev1', label: 'פסטיבל בריכת הסולטן', count: 2690 },
                { val: 'not-checked', label: 'טרם נכנסו לאירוע', count: 1430 },
              ].map(({ val, label, count }) => (
                <label key={val} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all"
                  style={audience === val ? { background: '#f3f0ff', border: '1.5px solid #7c3aed' } : { border: '1.5px solid #ddd6fe' }}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="audience" value={val} checked={audience === val} onChange={() => setAudience(val)} className="w-3.5 h-3.5" style={{ accentColor: '#7c3aed' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#f3f0ff', color: '#7c3aed' }}>{count.toLocaleString()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <h2 className="font-black mb-3" style={{ color: '#1a1a2e' }}>הודעה</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => { setMessage(t.body); setSelectedTemplate(i); }}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                  style={selectedTemplate === i ? { background: '#7c3aed', color: '#fff' } : { background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}>
                  {t.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                placeholder="כתוב את הודעתך כאן... השתמש ב {{שם}}, {{שם_אירוע}}, {{תאריך}} לשדות דינמיים"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: '#faf8ff', border: '1.5px solid #ddd6fe', color: '#1a1a2e' }}
              />
              {message && (
                <button onClick={() => { setMessage(''); setSelectedTemplate(null); }} className="absolute top-2 left-2 p-1" style={{ color: '#9b8fb0' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-xs mt-1.5 text-right" style={{ color: '#9b8fb0' }}>{message.length} תווים</p>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <h2 className="font-black mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
              <Clock size={15} style={{ color: '#7c3aed' }} /> תזמון (אופציונלי)
            </h2>
            <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" dir="ltr"
              style={{ background: '#faf8ff', border: '1.5px solid #ddd6fe', color: '#1a1a2e' }} />
            {scheduledTime && (
              <p className="text-xs mt-1.5" style={{ color: '#9b8fb0' }}>
                ההודעה תישלח ב: {new Date(scheduledTime).toLocaleString('he-IL')}
              </p>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message || sending}
            className="w-full py-3.5 rounded-full font-black flex items-center justify-center gap-2 transition-all"
            style={sent ? { background: '#dcfce7', color: '#15803d' } : !message || sending ? { background: '#ddd6fe', color: '#9b8fb0' } : { background: '#ffd433', color: '#1a1a2e' }}
          >
            {sent ? <><CheckCircle size={16} /> נשלח בהצלחה!</> :
              sending ? <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> שולח...</> :
                <><Send size={16} /> {scheduledTime ? 'תזמן שליחה' : `שלח ל-${audience === 'all' ? '2,690' : audience === 'ev1' ? '2,690' : '1,430'} נמענים`}</>}
          </button>
        </div>

        {/* Campaign history */}
        <div>
          <h2 className="font-black mb-4" style={{ color: '#1a1a2e' }}>קמפיינים קודמים</h2>
          <div className="space-y-3">
            {mockCampaigns.map(camp => {
              const ch = CHANNEL_CONFIG[camp.channel];
              const ChIcon = ch.icon;
              return (
                <div key={camp.id} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #ddd6fe' }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: ch.bg, color: ch.color }}>
                          <ChIcon size={13} />
                        </div>
                        <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{camp.name}</p>
                      </div>
                      <p className="text-xs" style={{ color: '#9b8fb0' }}>{camp.sentAt}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0"
                      style={camp.status === 'sent' ? { background: '#dcfce7', color: '#15803d' } : camp.status === 'scheduled' ? { background: '#fef9c3', color: '#a16207' } : { background: '#f1f5f9', color: '#64748b' }}>
                      {camp.status === 'sent' ? 'נשלח' : camp.status === 'scheduled' ? 'מתוזמן' : 'טיוטה'}
                    </span>
                  </div>
                  {camp.status === 'sent' && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg py-1.5" style={{ background: '#faf8ff' }}>
                        <p className="text-sm font-black" style={{ color: '#1a1a2e' }}>{camp.recipients.toLocaleString()}</p>
                        <p className="text-xs" style={{ color: '#9b8fb0' }}>נמענים</p>
                      </div>
                      <div className="rounded-lg py-1.5" style={{ background: '#dcfce7' }}>
                        <p className="text-sm font-black" style={{ color: '#15803d' }}>{camp.sent.toLocaleString()}</p>
                        <p className="text-xs" style={{ color: '#15803d' }}>נשלחו</p>
                      </div>
                      <div className="rounded-lg py-1.5" style={{ background: camp.failed > 0 ? '#fee2e2' : '#f1f5f9' }}>
                        <p className="text-sm font-black" style={{ color: camp.failed > 0 ? '#b91c1c' : '#64748b' }}>{camp.failed}</p>
                        <p className="text-xs" style={{ color: camp.failed > 0 ? '#b91c1c' : '#64748b' }}>כשלו</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
