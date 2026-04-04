import { useState, useEffect, useRef } from 'react'
import { fetchDevices } from '../api/devicesApi.js'

export function useDevices() {
  const [devices, setDevices] = useState([])
  const [deviceMap, setDeviceMap] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const data = await fetchDevices()
      setDevices(data)
      setDeviceMap(new Map(data.map(d => [d.mac, d])))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return { devices, deviceMap, loading, error, reload: load }
}
