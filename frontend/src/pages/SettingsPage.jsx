import { useState, useEffect } from 'react'
import { fetchNotifSettings, updateNotifSettings, testNotifChannel } from '../api/settingsApi.js'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 20 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'var(--bg-primary)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '8px 12px', fontSize: 13,
          color: 'var(--text-primary)', outline: 'none', width: '100%',
        }}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      {children}
    </div>
  )
}

function StatusMsg({ msg }) {
  if (!msg) return null
  const ok = msg.startsWith('ok:')
  return (
    <span style={{
      fontSize: 12,
      color: ok ? '#22c55e' : '#ef4444',
    }}>
      {ok ? msg.slice(3) : msg}
    </span>
  )
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    email_enabled: false, smtp_host: '', smtp_port: 587, smtp_user: '',
    smtp_password: '', smtp_from: '', alert_email_to: '',
    slack_enabled: false, slack_webhook: '',
    telegram_enabled: false, telegram_token: '', telegram_chat_id: '',
  })
  const [status, setStatus] = useState({ email: '', slack: '', telegram: '' })
  const [testing, setTesting] = useState({ email: false, slack: false, telegram: false })

  useEffect(() => {
    fetchNotifSettings().then(data => setForm(f => ({ ...f, ...data }))).catch(() => {})
  }, [])

  function set(key) {
    return val => setForm(f => ({ ...f, [key]: val }))
  }

  async function save(channel) {
    try {
      await updateNotifSettings(form)
      setStatus(s => ({ ...s, [channel]: 'ok:Saved' }))
      setTimeout(() => setStatus(s => ({ ...s, [channel]: '' })), 3000)
    } catch (e) {
      setStatus(s => ({ ...s, [channel]: e.message }))
    }
  }

  async function test(channel) {
    setTesting(t => ({ ...t, [channel]: true }))
    try {
      await updateNotifSettings(form)
      const res = await testNotifChannel(channel)
      setStatus(s => ({ ...s, [channel]: res.ok ? 'ok:Test sent!' : res.error }))
    } catch (e) {
      setStatus(s => ({ ...s, [channel]: e.message }))
    } finally {
      setTesting(t => ({ ...t, [channel]: false }))
      setTimeout(() => setStatus(s => ({ ...s, [channel]: '' })), 5000)
    }
  }

  const btnStyle = (variant = 'primary') => ({
    padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: 'none',
    background: variant === 'primary' ? 'var(--accent)' : 'rgba(255,255,255,0.07)',
    color: variant === 'primary' ? '#fff' : 'var(--text-secondary)',
  })

  return (
    <div style={{ padding: '32px 40px', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Notification Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Configure where to receive alerts when a threat is detected on your network.
        </p>
      </div>

      {/* Telegram */}
      <Section title="Telegram">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Toggle checked={form.telegram_enabled} onChange={set('telegram_enabled')} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {form.telegram_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <Field label="Bot Token" value={form.telegram_token} onChange={set('telegram_token')}
          placeholder="123456789:ABCdefGHI..." />
        <Field label="Chat ID" value={form.telegram_chat_id} onChange={set('telegram_chat_id')}
          placeholder="-100123456789 or your user ID" />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          Get token from <strong style={{ color: 'var(--accent)' }}>@BotFather</strong> →{' '}
          /newbot · Get your chat ID from{' '}
          <strong style={{ color: 'var(--accent)' }}>@userinfobot</strong>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btnStyle()} onClick={() => save('telegram')}>Save</button>
          <button style={btnStyle('ghost')} onClick={() => test('telegram')} disabled={testing.telegram}>
            {testing.telegram ? 'Sending…' : 'Send Test Message'}
          </button>
          <StatusMsg msg={status.telegram} />
        </div>
      </Section>

      {/* Slack */}
      <Section title="Slack">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Toggle checked={form.slack_enabled} onChange={set('slack_enabled')} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {form.slack_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <Field label="Incoming Webhook URL" value={form.slack_webhook} onChange={set('slack_webhook')}
          placeholder="https://hooks.slack.com/services/..." />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          Go to <strong style={{ color: 'var(--accent)' }}>api.slack.com/apps</strong> →
          Create App → Incoming Webhooks → Add to channel → copy URL
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btnStyle()} onClick={() => save('slack')}>Save</button>
          <button style={btnStyle('ghost')} onClick={() => test('slack')} disabled={testing.slack}>
            {testing.slack ? 'Sending…' : 'Send Test Message'}
          </button>
          <StatusMsg msg={status.slack} />
        </div>
      </Section>

      {/* Email */}
      <Section title="Email Alerts">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Toggle checked={form.email_enabled} onChange={set('email_enabled')} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {form.email_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="SMTP Host" value={form.smtp_host} onChange={set('smtp_host')}
            placeholder="smtp.gmail.com" />
          <Field label="SMTP Port" type="number" value={form.smtp_port} onChange={v => set('smtp_port')(Number(v))}
            placeholder="587" />
          <Field label="Username" value={form.smtp_user} onChange={set('smtp_user')}
            placeholder="you@gmail.com" />
          <Field label="Password" type="password" value={form.smtp_password} onChange={set('smtp_password')}
            placeholder="App password" />
          <Field label="From Address" value={form.smtp_from} onChange={set('smtp_from')}
            placeholder="you@gmail.com" />
          <Field label="Send Alerts To" value={form.alert_email_to} onChange={set('alert_email_to')}
            placeholder="alerts@yourdomain.com" />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          Gmail: enable 2FA → Google Account → Security → App Passwords → generate one
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btnStyle()} onClick={() => save('email')}>Save</button>
          <button style={btnStyle('ghost')} onClick={() => test('email')} disabled={testing.email}>
            {testing.email ? 'Sending…' : 'Send Test Email'}
          </button>
          <StatusMsg msg={status.email} />
        </div>
      </Section>
    </div>
  )
}
