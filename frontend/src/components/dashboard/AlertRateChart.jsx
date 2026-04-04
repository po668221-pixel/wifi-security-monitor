import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ALERT_TYPE_META } from '../../data/alertTypes.js'

const TYPES = ['ARP_SPOOF', 'DEAUTH_FLOOD', 'EVIL_TWIN_AP', 'PORT_SCAN']

export default function AlertRateChart({ hourlyBuckets }) {
  const data = hourlyBuckets.map(b => ({ name: b.label, ...b.counts }))

  return (
    <div className="card" style={{ flex: 1 }}>
      <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
        Alert Rate — Last 60 min
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          {TYPES.map(t => (
            <Bar key={t} dataKey={t} stackId="a" fill={ALERT_TYPE_META[t]?.color || '#888'} radius={t === 'PORT_SCAN' ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
