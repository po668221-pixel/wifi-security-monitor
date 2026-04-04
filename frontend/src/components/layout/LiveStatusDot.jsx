export default function LiveStatusDot({ status }) {
  const colors = {
    connected: '#22c55e',
    connecting: '#3b82f6',
    reconnecting: '#3b82f6',
    disconnected: '#ef4444',
  }
  const labels = {
    connected: 'Live',
    connecting: 'Connecting…',
    reconnecting: 'Reconnecting…',
    disconnected: 'Offline',
  }
  const color = colors[status] || colors.disconnected

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block',
        boxShadow: status === 'connected' ? `0 0 0 0 ${color}` : 'none',
        animation: status === 'connected' ? 'pulse-ring 2s infinite' : 'none',
      }} />
      {labels[status]}
    </span>
  )
}
