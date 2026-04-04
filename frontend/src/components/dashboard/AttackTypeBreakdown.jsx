import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ALERT_TYPE_META } from '../../data/alertTypes.js'

export default function AttackTypeBreakdown({ byType }) {
  const data = Object.entries(byType)
    .filter(([, v]) => v > 0)
    .map(([type, value]) => ({ type, value, meta: ALERT_TYPE_META[type] }))

  if (!data.length) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Attack Types</h3>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No alerts yet
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Attack Types</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
            {data.map((entry) => (
              <Cell key={entry.type} fill={entry.meta?.color || '#888'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
            formatter={(v, name) => [v, ALERT_TYPE_META[name]?.label || name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {data.map(({ type, value, meta }) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta?.color || '#888', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{meta?.label || type}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: meta?.color || 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
