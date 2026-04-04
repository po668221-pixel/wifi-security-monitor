import { SEVERITY_META } from '../../data/alertTypes.js'

export default function SeverityBadge({ severity }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.MEDIUM
  return (
    <span className="badge" style={{ background: meta.bgColor, color: meta.color }}>
      {meta.label}
    </span>
  )
}
