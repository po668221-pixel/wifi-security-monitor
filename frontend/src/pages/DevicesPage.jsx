import DeviceGrid from '../components/devices/DeviceGrid.jsx'
import { useAlertsContext } from '../context/AlertsContext.js'
import { useDevicesContext } from '../context/DevicesContext.js'

export default function DevicesPage() {
  const { alerts } = useAlertsContext()
  const { devices, loading } = useDevicesContext()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Devices</h1>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {devices.length} devices · refreshes every 30s
        </span>
      </div>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <DeviceGrid devices={devices} alerts={alerts} />
      )}
    </div>
  )
}
