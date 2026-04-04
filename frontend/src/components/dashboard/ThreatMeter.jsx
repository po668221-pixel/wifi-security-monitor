export default function ThreatMeter({ score }) {
  const color = score >= 61 ? '#ef4444' : score >= 21 ? '#f97316' : '#22c55e'
  const label = score >= 61 ? 'HIGH THREAT' : score >= 21 ? 'ELEVATED' : 'NORMAL'
  const radius = 60
  const circ = 2 * Math.PI * radius
  const dash = circ * (1 - score / 100)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', alignSelf: 'flex-start' }}>
        Threat Level
      </h3>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={80} cy={80} r={radius} fill="none" stroke="var(--border)" strokeWidth={10} />
        <circle
          cx={80} cy={80} r={radius} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
        <text x={80} y={76} textAnchor="middle" fill={color} fontSize={28} fontWeight={700}>{score}</text>
        <text x={80} y={98} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>{label}</text>
      </svg>
      <div style={{ display: 'flex', gap: 16 }}>
        {[['CRITICAL', '#ef4444'], ['HIGH', '#f97316'], ['MEDIUM', '#3b82f6']].map(([s, c]) => (
          <span key={s} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ color: c }}>●</span> {s}
          </span>
        ))}
      </div>
    </div>
  )
}
