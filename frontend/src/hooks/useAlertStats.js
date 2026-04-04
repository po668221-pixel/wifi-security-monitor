import { useMemo } from 'react'

const BUCKET_MINUTES = 5
const BUCKET_COUNT = 12  // 60 min
const ALERT_TYPES = ['ARP_SPOOF', 'DEAUTH_FLOOD', 'EVIL_TWIN_AP', 'PORT_SCAN']

export function useAlertStats(alerts, deviceMap) {
  return useMemo(() => {
    const now = Date.now()
    const windowMs = BUCKET_COUNT * BUCKET_MINUTES * 60 * 1000

    const recent = alerts.filter(a => {
      if (!a.timestamp) return false
      return (now - new Date(a.timestamp).getTime()) < windowMs
    })

    // Severity counts (recent window)
    const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    const byType = {}
    for (const a of recent) {
      if (a.severity && bySeverity[a.severity] !== undefined) bySeverity[a.severity]++
      if (a.type) byType[a.type] = (byType[a.type] || 0) + 1
    }

    // Threat score: decays over 60-min window
    const threatScore = Math.min(
      100,
      (bySeverity.CRITICAL * 4) + (bySeverity.HIGH * 2) + (bySeverity.MEDIUM * 1)
    )

    // Unacknowledged count (all time)
    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length

    // Hourly buckets for chart
    const hourlyBuckets = Array.from({ length: BUCKET_COUNT }, (_, i) => {
      const bucketStart = now - (BUCKET_COUNT - i) * BUCKET_MINUTES * 60 * 1000
      const bucketEnd = bucketStart + BUCKET_MINUTES * 60 * 1000
      const counts = Object.fromEntries(ALERT_TYPES.map(t => [t, 0]))
      for (const a of recent) {
        const t = new Date(a.timestamp).getTime()
        if (t >= bucketStart && t < bucketEnd && a.type) {
          counts[a.type] = (counts[a.type] || 0) + 1
        }
      }
      return { label: `-${(BUCKET_COUNT - i) * BUCKET_MINUTES}m`, counts }
    })

    // Top threatened devices by alert count
    const macCounts = {}
    for (const a of alerts) {
      const mac = extractMac(a)
      if (mac) macCounts[mac] = (macCounts[mac] || 0) + 1
    }
    const topDevices = Object.entries(macCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mac, count]) => ({ mac, count, device: deviceMap?.get(mac) || null }))

    // Burst detection: 3+ same-type alerts in last 2 min from WS
    const twoMinAgo = now - 2 * 60 * 1000
    const recentBurst = alerts.filter(a => a.timestamp && new Date(a.timestamp).getTime() > twoMinAgo)
    const burstCounts = {}
    for (const a of recentBurst) {
      if (a.type) burstCounts[a.type] = (burstCounts[a.type] || 0) + 1
    }
    const burstType = Object.entries(burstCounts).find(([, c]) => c >= 3)
    const burstDetection = burstType
      ? { type: burstType[0], count: burstType[1] }
      : null

    return { threatScore, bySeverity, byType, unacknowledgedCount, hourlyBuckets, topDevices, burstDetection }
  }, [alerts, deviceMap])
}

function extractMac(alert) {
  const text = `${alert.message || ''} ${alert.type || ''}`
  const match = text.match(/([0-9a-f]{2}(:[0-9a-f]{2}){5})/i)
  return match ? match[1].toLowerCase() : null
}
