import { NavLink, useNavigate } from 'react-router-dom'
import LiveStatusDot from './LiveStatusDot.jsx'
import { useSettingsContext } from '../../context/SettingsContext.js'
import { useAuthContext } from '../../context/AuthContext.js'

const navItems = [
  { to: '/',         label: 'Dashboard' },
  { to: '/alerts',   label: 'Alerts' },
  { to: '/devices',  label: 'Devices' },
  { to: '/settings', label: 'Settings' },
]

export default function NavBar({ wsStatus, unacknowledgedCount }) {
  const { autoBlock, setAutoBlock } = useSettingsContext() || {}
  const { logout } = useAuthContext() || {}
  const navigate = useNavigate()

  function handleLogout() {
    logout?.()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{
      height: 56, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
          WiFi Monitor
        </span>
        <nav style={{ display: 'flex', gap: 4 }}>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              })}
            >
              {label}
              {label === 'Alerts' && unacknowledgedCount > 0 && (
                <span style={{
                  background: 'var(--critical)', color: '#fff', borderRadius: 10,
                  padding: '1px 6px', fontSize: 10, fontWeight: 700,
                }}>
                  {unacknowledgedCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setAutoBlock?.(!autoBlock)}
          style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', border: 'none', letterSpacing: 0.4, transition: 'all 0.2s',
            background: autoBlock ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
            color: autoBlock ? '#ef4444' : 'var(--text-muted)',
            outline: autoBlock ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
          }}
        >
          {autoBlock ? 'AUTO-BLOCK: ON' : 'Auto-Block: OFF'}
        </button>

        <LiveStatusDot status={wsStatus} />

        <button
          onClick={handleLogout}
          style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}
