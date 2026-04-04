import { ALERT_TYPE_META } from '../../data/alertTypes.js'

export default function AlertBurst({ burst }) {
  if (!burst) return null
  const meta = ALERT_TYPE_META[burst.type]
  return (
    <div style={{
      background: 'rgba(234,179,8,0.1)', border: '1px solid var(--medium)',
      borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ color: 'var(--medium)', fontSize: 16 }}>⚠</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
        <strong>Burst detected</strong> — {burst.count} <em>{meta?.label || burst.type}</em> alerts in the last 2 minutes
      </span>
    </div>
  )
}
