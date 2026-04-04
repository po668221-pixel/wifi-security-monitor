import { useState } from 'react'
import VendorBadge from './VendorBadge.jsx'
import DeviceTimeline from './DeviceTimeline.jsx'
import SeverityBadge from '../shared/SeverityBadge.jsx'
import TimeAgo from '../shared/TimeAgo.jsx'
import { blockDevice, unblockDevice, whitelistDevice } from '../../api/devicesApi.js'

function isActive(device) {
  if (!device.last_seen) return false
  return (Date.now() - new Date(device.last_seen).getTime()) < 5 * 60 * 1000
}

export default function DeviceCard({ device, alerts }) {
  const [expanded, setExpanded] = useState(false)
  const [isBlocked, setIsBlocked] = useState(device.is_blocked || false)
  const [isWhitelisted, setIsWhitelisted] = useState(device.is_whitelisted || false)
  const [busy, setBusy] = useState(false)
  const active = isActive(device)

  const alertCounts = {}
  for (const a of alerts) {
    if (a.severity) alertCounts[a.severity] = (alertCounts[a.severity] || 0) + 1
  }

  async function handleBlock() {
    setBusy(true)
    try {
      await blockDevice(device.mac)
      setIsBlocked(true)
    } finally {
      setBusy(false)
    }
  }

  async function handleUnblock() {
    setBusy(true)
    try {
      await unblockDevice(device.mac)
      setIsBlocked(false)
    } finally {
      setBusy(false)
    }
  }

  async function handleWhitelist() {
    setBusy(true)
    try {
      await whitelistDevice(device.mac)
      setIsBlocked(false)
      setIsWhitelisted(true)
    } finally {
      setBusy(false)
    }
  }

  const borderColor = isBlocked
    ? 'rgba(239,68,68,0.4)'
    : active
    ? 'rgba(0,229,255,0.2)'
    : 'var(--border)'

  return (
    <div
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        border: `1px solid ${borderColor}`,
        animation: active && !isBlocked ? 'pulse-ring 3s infinite' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
            {device.hostname || device.ip || device.mac}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{device.mac}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isWhitelisted && (
            <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 10 }}>
              Whitelisted
            </span>
          )}
          {isBlocked && (
            <span style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 10 }}>
              Blocked
            </span>
          )}
          {active && !isBlocked && (
            <span style={{ fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 10 }}>
              Active
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {device.ip && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, width: 60 }}>IP</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{device.ip}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, width: 60 }}>Vendor</span>
          <VendorBadge vendor={device.vendor} hostname={device.hostname} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, width: 60 }}>Last seen</span>
          <TimeAgo timestamp={device.last_seen} />
        </div>
      </div>

      {Object.keys(alertCounts).length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(alertCounts).map(([sev, count]) => (
            <span key={sev} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <SeverityBadge severity={sev} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>×{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Block / Unblock / Whitelist actions */}
      {!isWhitelisted && (
        <div style={{ display: 'flex', gap: 6, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          {isBlocked ? (
            <button
              onClick={handleUnblock}
              disabled={busy}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: 'rgba(249,115,22,0.1)', color: '#f97316',
                border: '1px solid rgba(249,115,22,0.3)', cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? '…' : 'Unblock'}
            </button>
          ) : (
            <button
              onClick={handleBlock}
              disabled={busy}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.25)', cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? '…' : 'Block'}
            </button>
          )}
          <button
            onClick={handleWhitelist}
            disabled={busy}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 4, fontSize: 11, fontWeight: 600,
              background: 'rgba(34,197,94,0.08)', color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.25)', cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? '…' : 'Whitelist'}
          </button>
        </div>
      )}

      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: 'none', color: 'var(--text-muted)', fontSize: 11,
          textAlign: 'left', padding: '4px 0', borderTop: '1px solid var(--border)',
        }}
      >
        {expanded ? '▲ Hide timeline' : '▼ Show timeline'}
      </button>

      {expanded && <DeviceTimeline device={device} alerts={alerts} />}
    </div>
  )
}
