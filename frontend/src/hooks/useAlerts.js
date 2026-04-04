import { useState, useEffect, useCallback } from 'react'
import { fetchAlerts, acknowledgeAlert } from '../api/alertsApi.js'
import { useAlertStream } from '../ws/useAlertStream.js'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newAlert, setNewAlert] = useState(null)

  async function load() {
    try {
      const data = await fetchAlerts(0, 200)
      setAlerts(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWsAlert = useCallback((alert) => {
    setAlerts(prev => {
      if (prev.some(a => a.id === alert.id)) return prev
      return [alert, ...prev]
    })
    setNewAlert(alert)
  }, [])

  const wsStatus = useAlertStream(handleWsAlert)

  useEffect(() => { load() }, [])

  async function ack(id) {
    // optimistic update
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
    try {
      await acknowledgeAlert(id)
    } catch {
      // roll back
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: false } : a))
    }
  }

  return { alerts, loading, error, wsStatus, newAlert, ack }
}
