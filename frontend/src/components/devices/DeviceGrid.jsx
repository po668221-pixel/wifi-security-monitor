import DeviceCard from './DeviceCard.jsx'

export default function DeviceGrid({ devices, alerts }) {
  if (!devices.length) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        No devices detected yet. Start the capture to populate the inventory.
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
    }}>
      {devices.map(device => {
        const deviceAlerts = alerts.filter(a => {
          const text = `${a.message || ''}`
          return text.toLowerCase().includes(device.mac.toLowerCase())
        })
        return <DeviceCard key={device.mac} device={device} alerts={deviceAlerts} />
      })}
    </div>
  )
}
