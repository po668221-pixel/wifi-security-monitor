import { SEVERITY_META } from '../../data/alertTypes.js'

export default function DeviceTimeline({ device, alerts }) {
  const firstSeen = device.first_seen ? new Date(device.first_seen).getTime() : null
  const lastSeen = device.last_seen ? new Date(device.last_seen).getTime() : null
  if (!firstSeen || !lastSeen || firstSeen === lastSeen) return null

  const span = lastSeen - firstSeen

  const relevantAlerts = alerts.filter(a => {
    if (!a.timestamp) return false
    const t = new Date(a.timestamp).getTime()
    return t >= firstSeen && t <= lastSeen
  })

  return (
    <div style={{ padding: '12px 0 4px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Device timeline</div>
      <div style={{ position: 'relative', height: 24 }}>
        {/* Track */}
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 4, background: 'var(--border)', borderRadius: 2 }} />
        {/* Alert markers */}
        {relevantAlerts.map(a => {
          const t = new Date(a.timestamp).getTime()
          const pct = ((t - firstSeen) / span) * 100
          const color = SEVERITY_META[a.severity]?.color || '#888'
          return (
            <div key={a.id} title={`${a.type} — ${new Date(a.timestamp).toLocaleString()}`} style={{
              position: 'absolute', top: 6, left: `${pct}%`,
              width: 12, height: 12, borderRadius: '50%',
              background: color, transform: 'translateX(-50%)',
              border: '2px solid var(--bg-card)', cursor: 'default',
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(firstSeen).toLocaleDateString()}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(lastSeen).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
