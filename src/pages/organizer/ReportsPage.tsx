import { BarChart2, Download, TrendingUp, DollarSign, Ticket } from 'lucide-react';
import { mockEvents } from '../../data/organizer';

function BarChartViz({ data }: { data: { label: string; val: number }[] }) {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map(({ label, val }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-lg transition-all"
            style={{ height: `${(val / max) * 100}%`, background: '#7c3aed', minHeight: '4px' }}
          />
          <span className="text-xs" style={{ color: '#9b8fb0' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const totalRevenue = mockEvents.reduce((s, e) => s + e.revenue, 0);
  const totalSold = mockEvents.reduce((s, e) => s + e.soldTickets, 0);
  const platformFee = Math.round(totalRevenue * 0.05);

  const monthlyData = [
    { label: 'ינו', val: 0 },
    { label: 'פבר', val: 0 },
    { label: 'מרץ', val: 0 },
    { label: 'אפר', val: 12000 },
    { label: 'מאי', val: 45000 },
    { label: 'יונ', val: 887400 },
    { label: 'יול', val: 89200 },
    { label: 'אוג', val: 0 },
  ].filter(d => d.val > 0 || true);

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>דוחות</h1>
          <p className="text-sm mt-1" style={{ color: '#9b8fb0' }}>סיכום פיננסי ונתוני מכירות</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: '#faf8ff', color: '#6b5a8a', border: '1px solid #ddd6fe' }}>
          <Download size={14} /> ייצוא PDF
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: DollarSign, label: 'הכנסה כוללת (ברוטו)', value: `₪${totalRevenue.toLocaleString()}`, color: '#7c3aed' },
          { icon: DollarSign, label: 'עמלות פלטפורמה', value: `₪${platformFee.toLocaleString()}`, color: '#f59e0b' },
          { icon: DollarSign, label: 'הכנסה נטו', value: `₪${(totalRevenue - platformFee).toLocaleString()}`, color: '#10b981' },
          { icon: Ticket, label: 'כרטיסים נמכרו', value: totalSold.toLocaleString(), color: '#8b5cf6' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ddd6fe' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15`, color }}>
              <Icon size={17} />
            </div>
            <p className="text-xl font-black" style={{ color: '#1a1a2e' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9b8fb0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #ddd6fe' }}>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} style={{ color: '#7c3aed' }} />
          <h2 className="font-black" style={{ color: '#1a1a2e' }}>הכנסות חודשיות</h2>
        </div>
        <BarChartViz data={monthlyData.map(d => ({ label: d.label, val: d.val || 1 }))} />
      </div>

      {/* Per event */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd6fe' }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f3f0ff' }}>
          <BarChart2 size={16} style={{ color: '#7c3aed' }} />
          <h2 className="font-black" style={{ color: '#1a1a2e' }}>דוח לפי אירוע</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#fbfaff', borderBottom: '1px solid #f3f0ff' }}>
                {['אירוע', 'כרטיסים', 'הכנסה', 'עמלה', 'נטו', 'אחוז מילוי'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold" style={{ color: '#9b8fb0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockEvents.map(ev => {
                const fee = Math.round(ev.revenue * 0.05);
                const net = ev.revenue - fee;
                const pct = Math.round((ev.soldTickets / ev.totalTickets) * 100);
                return (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #faf8ff' }}>
                    <td className="px-4 py-3">
                      <p className="font-bold" style={{ color: '#1a1a2e' }}>{ev.name}</p>
                      <p className="text-xs" style={{ color: '#9b8fb0' }}>{ev.date}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#1a1a2e' }}>{ev.soldTickets.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#1a1a2e' }}>₪{ev.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: '#f59e0b' }}>₪{fee.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#10b981' }}>₪{net.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f0ff' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? '#e94560' : '#7c3aed' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#1a1a2e' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
