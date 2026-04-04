import AlertRow from './AlertRow.jsx'

const TH = ({ children }) => (
  <th style={{
    padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5,
    borderBottom: '1px solid var(--border)',
  }}>
    {children}
  </th>
)

export default function AlertTable({ alerts, deviceMap, onRowClick, onAck }) {
  if (!alerts.length) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        No alerts match the current filters.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <TH>Severity</TH>
            <TH>Type</TH>
            <TH>Time</TH>
            <TH>Device</TH>
            <TH>Message</TH>
            <TH>Action</TH>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => {
            const mac = extractMac(alert)
            const device = mac ? deviceMap?.get(mac) : null
            return (
              <AlertRow
                key={alert.id}
                alert={alert}
                device={device}
                onClick={() => onRowClick(alert)}
                onAck={onAck}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function extractMac(alert) {
  const text = `${alert.message || ''}`
  const match = text.match(/([0-9a-f]{2}(:[0-9a-f]{2}){5})/i)
  return match ? match[1].toLowerCase() : null
}
