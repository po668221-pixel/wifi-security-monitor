export default function TopThreatenedDevices({ topDevices }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
        Most Targeted Devices
      </h3>
      {!topDevices.length ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topDevices.map(({ mac, count, device }, i) => {
            const label = device ? (device.hostname || device.ip || mac) : mac
            const pct = Math.round((count / topDevices[0].count) * 100)
            return (
              <div key={mac}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    #{i + 1} {label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--high)' }}>{count} alerts</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                  <div style={{ height: 4, width: `${pct}%`, background: 'var(--high)', borderRadius: 2, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
