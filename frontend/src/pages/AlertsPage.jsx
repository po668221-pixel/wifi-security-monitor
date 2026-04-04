import { useState, useMemo } from 'react'
import FilterBar from '../components/alerts/FilterBar.jsx'
import AlertTable from '../components/alerts/AlertTable.jsx'
import AlertDetailDrawer from '../components/alerts/AlertDetailDrawer.jsx'
import AlertBurst from '../components/alerts/AlertBurst.jsx'
import { useAlertsContext } from '../context/AlertsContext.js'
import { useDevicesContext } from '../context/DevicesContext.js'

const DEFAULT_FILTERS = { severity: 'ALL', type: 'ALL', status: 'ALL' }

export default function AlertsPage() {
  const { alerts, ack, stats } = useAlertsContext()
  const { deviceMap } = useDevicesContext()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filters.severity !== 'ALL' && a.severity !== filters.severity) return false
      if (filters.type !== 'ALL' && a.type !== filters.type) return false
      if (filters.status === 'ACKNOWLEDGED' && !a.acknowledged) return false
      if (filters.status === 'UNACKNOWLEDGED' && a.acknowledged) return false
      return true
    })
  }, [alerts, filters])

  const selectedDevice = useMemo(() => {
    if (!selected) return null
    const text = selected.message || ''
    const match = text.match(/([0-9a-f]{2}(:[0-9a-f]{2}){5})/i)
    return match ? deviceMap?.get(match[1].toLowerCase()) : null
  }, [selected, deviceMap])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Alerts</h1>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {stats.unacknowledgedCount} unacknowledged · {alerts.length} total
        </span>
      </div>

      <AlertBurst burst={stats.burstDetection} />
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <AlertTable
          alerts={filtered}
          deviceMap={deviceMap}
          onRowClick={setSelected}
          onAck={ack}
        />
      </div>

      <AlertDetailDrawer
        alert={selected}
        device={selectedDevice}
        onClose={() => setSelected(null)}
        onAck={(id) => { ack(id); setSelected(a => a?.id === id ? { ...a, acknowledged: true } : a) }}
      />
    </div>
  )
}
