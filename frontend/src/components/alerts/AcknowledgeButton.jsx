export default function AcknowledgeButton({ alert, onAck }) {
  if (alert.acknowledged) {
    return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Acknowledged</span>
  }
  return (
    <button
      onClick={e => { e.stopPropagation(); onAck(alert.id) }}
      style={{
        padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
        background: 'var(--accent-dim)', color: 'var(--accent)',
        border: '1px solid var(--accent)', transition: 'all 0.15s',
      }}
    >
      Acknowledge
    </button>
  )
}
