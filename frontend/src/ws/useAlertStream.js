import { useEffect, useRef, useState, useCallback } from 'react'
import { getToken } from '../api/authApi.js'

function getWsUrl() {
  const token = getToken()
  return `ws://${window.location.host}/ws/alerts${token ? `?token=${token}` : ''}`
}
const MAX_BACKOFF = 30000

export function useAlertStream(onAlert) {
  const [status, setStatus] = useState('disconnected')
  const wsRef = useRef(null)
  const backoffRef = useRef(1000)
  const onAlertRef = useRef(onAlert)
  const unmountedRef = useRef(false)

  useEffect(() => { onAlertRef.current = onAlert }, [onAlert])

  const connect = useCallback(() => {
    if (unmountedRef.current) return
    const ws = new WebSocket(getWsUrl())
    wsRef.current = ws
    setStatus('connecting')

    ws.onopen = () => {
      if (unmountedRef.current) { ws.close(); return }
      setStatus('connected')
      backoffRef.current = 1000
    }

    ws.onmessage = (e) => {
      try {
        const alert = JSON.parse(e.data)
        onAlertRef.current?.(alert)
      } catch {}
    }

    ws.onclose = () => {
      if (unmountedRef.current) return
      setStatus('reconnecting')
      setTimeout(connect, backoffRef.current)
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    unmountedRef.current = false
    connect()
    return () => {
      unmountedRef.current = true
      wsRef.current?.close()
    }
  }, [connect])

  return status
}
