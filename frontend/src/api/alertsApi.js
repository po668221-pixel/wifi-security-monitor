import { getToken } from './authApi.js'

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchAlerts(skip = 0, limit = 200) {
  const res = await fetch(`/api/alerts?skip=${skip}&limit=${limit}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`)
  return res.json()
}

export async function acknowledgeAlert(id) {
  const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: 'PATCH', headers: authHeaders() })
  if (!res.ok) throw new Error(`Failed to acknowledge alert: ${res.status}`)
  return res.json()
}
