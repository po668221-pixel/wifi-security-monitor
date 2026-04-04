import { useState } from 'react'
import SeverityBadge from '../shared/SeverityBadge.jsx'
import AlertTypeBadge from '../shared/AlertTypeBadge.jsx'
import TimeAgo from '../shared/TimeAgo.jsx'
import AcknowledgeButton from './AcknowledgeButton.jsx'
import { ALERT_TYPE_META } from '../../data/alertTypes.js'
import { blockDevice } from '../../api/devicesApi.js'

export default function AlertDetailDrawer({ alert, device, onClose, onAck }) {
  const [blocking, setBlocking] = useState(false)
  const [blocked, setBlocked] = useState(false)

  if (!alert) return null
  const meta = ALERT_TYPE_META[alert.type]

  async function handleBlock() {
    if (!device?.mac) return
    setBlocking(true)
    try {
      await blockDevice(device.mac)
      setBlocked(true)
    } finally {
      setBlocking(false)
    }
  }

  const canBlock = device?.mac && !device?.is_blocked && !blocked

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, zIndex: 201,
        background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', animation: 'slide-in-right 0.2s ease',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <SeverityBadge severity={alert.severity} />
              <AlertTypeBadge type={alert.type} />
            </div>
            <button onClick={onClose} style={{ background: 'none', color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
          <TimeAgo timestamp={alert.timestamp} style={{ marginTop: 6, display: 'block' }} />
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Device identity */}
          <section>
            <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Suspected Device
            </h3>
            {device ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Hostname', device.hostname || '—'],
                  ['IP Address', device.ip || '—'],
                  ['MAC', device.mac],
                  ['Vendor', device.vendor || 'Unknown'],
                  ['First seen', device.first_seen ? new Date(device.first_seen).toLocaleString() : '—'],
                  ['Last seen', device.last_seen ? new Date(device.last_seen).toLocaleString() : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, width: 80, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Device not in inventory — may be a rogue device.</p>
            )}
          </section>

          {/* Alert context */}
          <section>
            <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Alert Context
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {alert.message || 'No message provided.'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'monospace' }}>
              ID: {alert.id}
            </p>
          </section>

          {/* Attack brief */}
          {meta && (
            <section style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 16 }}>
              <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Attack Brief
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                {meta.brief}
              </p>
              <h4 style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Response Steps</h4>
              <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {meta.responseSteps.map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
              {meta.mitreTechnique && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                  MITRE ATT&CK: {meta.mitreTechnique}
                </p>
              )}
            </section>
          )}

          {/* ML Anomaly Score */}
          {alert.ml_score != null && (
            <section style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 16 }}>
              <h3 style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                ML Anomaly Score
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 22, fontWeight: 700, fontFamily: 'monospace',
                  color: alert.ml_score < -0.05 ? '#ef4444' : alert.ml_score < 0 ? '#f97316' : '#22c55e',
                }}>
                  {alert.ml_score.toFixed(4)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {alert.ml_score < -0.05 ? 'High anomaly — unusual pattern' :
                   alert.ml_score < 0 ? 'Borderline — worth investigating' :
                   'Normal range'}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Isolation Forest score. Negative = more anomalous. Threshold: −0.05
              </p>
            </section>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
            <AcknowledgeButton alert={alert} onAck={onAck} />

            {canBlock && (
              <button
                onClick={handleBlock}
                disabled={blocking}
                style={{
                  padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.35)', cursor: blocking ? 'default' : 'pointer',
                  opacity: blocking ? 0.6 : 1,
                }}
              >
                {blocking ? 'Blocking…' : 'Block Device'}
              </button>
            )}

            {(blocked || device?.is_blocked) && (
              <span style={{
                padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                Blocked
              </span>
            )}

            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(alert, null, 2))}
              style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 11,
                background: 'transparent', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              Copy JSON
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
