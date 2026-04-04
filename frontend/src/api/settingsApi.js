import { getToken } from './authApi.js'

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchSettings() {
  const res = await fetch('/api/settings', { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`)
  return res.json()
}

export async function updateSettings(payload) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to update settings: ${res.status}`)
  return res.json()
}

export async function fetchNotifSettings() {
  const res = await fetch('/api/settings/notifications', { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch notification settings: ${res.status}`)
  return res.json()
}

export async function updateNotifSettings(payload) {
  const res = await fetch('/api/settings/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to save notification settings: ${res.status}`)
  return res.json()
}

export async function testNotifChannel(channel) {
  const res = await fetch('/api/settings/notifications/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ channel }),
  })
  if (!res.ok) throw new Error(`Test request failed: ${res.status}`)
  return res.json()
}
