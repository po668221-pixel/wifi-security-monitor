import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SeverityBadge from './SeverityBadge.jsx'
import AlertTypeBadge from './AlertTypeBadge.jsx'
import { SEVERITY_META } from '../../data/alertTypes.js'

function Toast({ toast, onDismiss }) {
  const navigate = useNavigate()
  const meta = SEVERITY_META[toast.severity] || SEVERITY_META.MEDIUM
  const autoDismissMs = toast.severity === 'CRITICAL' ? 8000 : toast.severity === 'HIGH' ? 5000 : 3000

  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast._toastId), autoDismissMs)
    return () => clearTimeout(id)
  }, [toast._toastId])

  return (
    <div
      onClick={() => { navigate('/alerts'); onDismiss(toast._toastId) }}
      style={{
        background: 'var(--bg-card)', border: `1px solid ${meta.color}`,
        boxShadow: `0 0 12px ${meta.color}40`,
        borderRadius: 'var(--radius)', padding: '12px 16px',
        cursor: 'pointer', animation: 'slide-in-right 0.2s ease',
        maxWidth: 340, minWidth: 280,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <SeverityBadge severity={toast.severity} />
        <AlertTypeBadge type={toast.type} />
        <button
          onClick={e => { e.stopPropagation(); onDismiss(toast._toastId) }}
          style={{ marginLeft: 'auto', background: 'none', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}
        >×</button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
        {toast.message || `${toast.type} detected`}
      </p>
    </div>
  )
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div style={{
      position: 'fixed', top: 70, right: 20, zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => <Toast key={t._toastId} toast={t} onDismiss={onDismiss} />)}
    </div>
  )
}
