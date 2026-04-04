import { ALERT_TYPE_META } from '../../data/alertTypes.js'

export default function AlertTypeBadge({ type }) {
  const meta = ALERT_TYPE_META[type]
  if (!meta) return <span className="badge badge-neutral">{type || 'UNKNOWN'}</span>
  return (
    <span className="badge" style={{ background: `${meta.color}22`, color: meta.color }}>
      {meta.icon} {meta.label}
    </span>
  )
}
