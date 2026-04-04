import ThreatMeter from '../components/dashboard/ThreatMeter.jsx'
import AlertRateChart from '../components/dashboard/AlertRateChart.jsx'
import AttackTypeBreakdown from '../components/dashboard/AttackTypeBreakdown.jsx'
import TopThreatenedDevices from '../components/dashboard/TopThreatenedDevices.jsx'
import RecentAlertFeed from '../components/dashboard/RecentAlertFeed.jsx'
import { useAlertsContext } from '../context/AlertsContext.js'

export default function DashboardPage() {
  const { alerts, stats } = useAlertsContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>

      {/* Summary counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Unacknowledged', value: stats.unacknowledgedCount, color: 'var(--accent)' },
          { label: 'Critical (60m)', value: stats.bySeverity.CRITICAL, color: 'var(--critical)' },
          { label: 'High (60m)',     value: stats.bySeverity.HIGH,     color: 'var(--high)' },
          { label: 'Medium (60m)',   value: stats.bySeverity.MEDIUM,   color: 'var(--medium)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 300px', gap: 16 }}>
        <ThreatMeter score={stats.threatScore} />
        <AlertRateChart hourlyBuckets={stats.hourlyBuckets} />
        <RecentAlertFeed alerts={alerts} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AttackTypeBreakdown byType={stats.byType} />
        <TopThreatenedDevices topDevices={stats.topDevices} />
      </div>
    </div>
  )
}
