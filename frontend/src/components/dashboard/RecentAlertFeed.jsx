import SeverityBadge from '../shared/SeverityBadge.jsx'
import AlertTypeBadge from '../shared/AlertTypeBadge.jsx'
import TimeAgo from '../shared/TimeAgo.jsx'
import { useNavigate } from 'react-router-dom'

export default function RecentAlertFeed({ alerts }) {
  const navigate = useNavigate()
  const recent = alerts.slice(0, 10)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Live Feed
        </h3>
        <button
          onClick={() => navigate('/alerts')}
          style={{ fontSize: 11, color: 'var(--accent)', background: 'none' }}
        >
          View all →
        </button>
      </div>
      {!recent.length ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No alerts yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          {recent.map(alert => (
            <div
              key={alert.id}
              className="fade-in"
              onClick={() => navigate('/alerts')}
              style={{
                padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 5,
              }}
            >
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <SeverityBadge severity={alert.severity} />
                <AlertTypeBadge type={alert.type} />
                <TimeAgo timestamp={alert.timestamp} style={{ marginLeft: 'auto' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {alert.message || `${alert.type} detected`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
