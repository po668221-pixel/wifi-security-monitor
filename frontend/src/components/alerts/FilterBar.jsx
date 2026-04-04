const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM']
const TYPES = ['ALL', 'ARP_SPOOF', 'DEAUTH_FLOOD', 'EVIL_TWIN_AP', 'PORT_SCAN']
const STATUSES = ['ALL', 'UNACKNOWLEDGED', 'ACKNOWLEDGED']

export default function FilterBar({ filters, onChange }) {
  const pill = (active) => ({
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: '1px solid',
    background: active ? 'var(--accent-dim)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {[
        { key: 'severity', label: 'Severity', options: SEVERITIES },
        { key: 'type',     label: 'Type',     options: TYPES },
        { key: 'status',   label: 'Status',   options: STATUSES },
      ].map(({ key, label, options }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, width: 60 }}>{label}</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {options.map(opt => (
              <button
                key={opt}
                style={pill(filters[key] === opt)}
                onClick={() => onChange({ ...filters, [key]: opt })}
              >
                {opt.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
