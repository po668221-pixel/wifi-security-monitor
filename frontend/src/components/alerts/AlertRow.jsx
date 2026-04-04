import SeverityBadge from '../shared/SeverityBadge.jsx'
import AlertTypeBadge from '../shared/AlertTypeBadge.jsx'
import TimeAgo from '../shared/TimeAgo.jsx'
import AcknowledgeButton from './AcknowledgeButton.jsx'

export default function AlertRow({ alert, device, onClick, onAck }) {
  const deviceLabel = device
    ? (device.hostname || device.ip || device.mac)
    : '—'

  return (
    <tr
      onClick={onClick}
      style={{
        cursor: 'pointer', borderBottom: '1px solid var(--border)',
        opacity: alert.acknowledged ? 0.5 : 1,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '10px 12px' }}><SeverityBadge severity={alert.severity} /></td>
      <td style={{ padding: '10px 12px' }}><AlertTypeBadge type={alert.type} /></td>
      <td style={{ padding: '10px 12px' }}><TimeAgo timestamp={alert.timestamp} /></td>
      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{deviceLabel}</td>
      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {alert.message || '—'}
      </td>
      <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
        <AcknowledgeButton alert={alert} onAck={onAck} />
      </td>
    </tr>
  )
}
