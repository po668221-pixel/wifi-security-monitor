import { getToken } from './authApi.js'

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchDevices() {
  const res = await fetch('/api/devices', { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch devices: ${res.status}`)
  return res.json()
}

export async function blockDevice(mac) {
  const res = await fetch(`/api/devices/${encodeURIComponent(mac)}/block`, { method: 'POST', headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to block device: ${res.status}`)
  return res.json()
}

export async function unblockDevice(mac) {
  const res = await fetch(`/api/devices/${encodeURIComponent(mac)}/unblock`, { method: 'POST', headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to unblock device: ${res.status}`)
  return res.json()
}

export async function whitelistDevice(mac) {
  const res = await fetch(`/api/devices/${encodeURIComponent(mac)}/whitelist`, { method: 'POST', headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to whitelist device: ${res.status}`)
  return res.json()
}

export async function fetchBlockedDevices() {
  const res = await fetch('/api/blocked', { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch blocked devices: ${res.status}`)
  return res.json()
}
