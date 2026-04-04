import { useState, useEffect } from 'react'
import NavBar from './NavBar.jsx'
import ToastContainer from '../shared/ToastContainer.jsx'
import { useAlerts } from '../../hooks/useAlerts.js'
import { useDevices } from '../../hooks/useDevices.js'
import { useAlertStats } from '../../hooks/useAlertStats.js'
import { useSettings } from '../../hooks/useSettings.js'

import { AlertsContext } from '../../context/AlertsContext.js'
import { DevicesContext } from '../../context/DevicesContext.js'
import { SettingsContext } from '../../context/SettingsContext.js'

export default function AppShell({ children }) {
  const alertsData = useAlerts()
  const devicesData = useDevices()
  const stats = useAlertStats(alertsData.alerts, devicesData.deviceMap)
  const settingsData = useSettings()

  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (!alertsData.newAlert) return
    const alert = alertsData.newAlert
    setToasts(prev => [{ ...alert, _toastId: Date.now() }, ...prev.slice(0, 4)])
  }, [alertsData.newAlert])

  function dismissToast(toastId) {
    setToasts(prev => prev.filter(t => t._toastId !== toastId))
  }

  return (
    <SettingsContext.Provider value={settingsData}>
      <AlertsContext.Provider value={{ ...alertsData, stats }}>
        <DevicesContext.Provider value={devicesData}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavBar wsStatus={alertsData.wsStatus} unacknowledgedCount={stats.unacknowledgedCount} />
            <main style={{ flex: 1, padding: '24px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
              {children}
            </main>
          </div>
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </DevicesContext.Provider>
      </AlertsContext.Provider>
    </SettingsContext.Provider>
  )
}
