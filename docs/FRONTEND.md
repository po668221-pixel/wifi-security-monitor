# Frontend Dashboard — Design & Build Plan

## Overview
A React + Vite dashboard that displays live WiFi security alerts, device inventory, and threat statistics. Designed to feel like a real analyst tool — not a generic table-and-badge UI.

## What Makes It Different

1. **Temporal awareness** — every view shows events in time context, not just a list
2. **Device identity continuity** — alerts are resolved to real devices (hostname, IP, vendor), not raw MACs
3. **Triage velocity** — from "live alert fires" to "acknowledged with context understood" in under 30 seconds
4. **Built-in domain knowledge** — each alert type has a static explanation, MITRE ATT&CK reference, and response steps

---

## Stack

| Package | Purpose |
|---|---|
| React 18 + Vite | Core framework + dev server |
| react-router-dom v6 | 3-page routing |
| recharts | AlertRateChart, donut breakdown |
| date-fns | Relative time formatting |

No component library (MUI/Chakra) — custom CSS keeps the design distinctive.

---

## Pages

### 1. Dashboard `/`
**Command centre — answers "is my network under attack right now?"**

Components:
- `ThreatMeter` — gauge, score = (CRITICAL×4 + HIGH×2 + MEDIUM×1), 60-min window, green→amber→red
- `AlertRateChart` — 12×5-min buckets, grouped by alert type (recharts)
- `AttackTypeBreakdown` — recharts donut, EVIL_TWIN_AP visually dominates regardless of count
- `TopThreatenedDevices` — top 5 MACs by alert count, enriched with hostname/IP
- `RecentAlertFeed` — last 10 alerts, live via WebSocket

### 2. Alerts `/alerts`
**Operational triage workspace**

Components:
- `FilterBar` — severity / type / ack status, all client-side
- `AlertTable + AlertRow` — columns: Severity, Type, Time, Device (resolved), Message, Status, Action
- `AlertDetailDrawer` — slide-in panel with: device identity, alert context, Attack Brief (static per type), acknowledge + copy JSON
- `AlertBurst` banner — fires when 3+ same-type alerts arrive within 2 min from WS
- `ToastContainer` — non-blocking toast on new WS alerts, click → opens drawer

### 3. Devices `/devices`
**Network inventory — devices as primary objects, alerts as their attributes**

Components:
- `DeviceGrid` — card grid, each card: vendor icon, hostname, IP, MAC, VendorBadge, alert chips, first/last seen, active pulse (if last_seen < 5 min)
- `DeviceTimeline` — expandable per card, horizontal bar first_seen→last_seen with alert overlays
- Unidentified device flag — `no hostname + unknown vendor` → amber `[UNIDENTIFIED DEVICE]` badge

---

## File Structure

```
frontend/src/
  api/
    devicesApi.js          ← GET /api/devices
    alertsApi.js           ← GET /api/alerts, PATCH /api/alerts/:id/acknowledge
  ws/
    useAlertStream.js      ← WS hook, exponential backoff reconnect
  hooks/
    useDevices.js          ← polls every 30s, exposes devices[] + deviceMap
    useAlerts.js           ← REST + WS merge, optimistic acknowledge
    useAlertStats.js       ← pure useMemo: threatScore, byType, hourlyBuckets, topDevices
  data/
    alertTypes.js          ← ALERT_TYPE_META: label, color, brief, responseSteps, MITRE per type
  pages/
    DashboardPage.jsx
    AlertsPage.jsx
    DevicesPage.jsx
  components/
    layout/
      AppShell.jsx
      NavBar.jsx
      LiveStatusDot.jsx    ← WS connection health indicator
    dashboard/
      ThreatMeter.jsx
      AlertRateChart.jsx
      AttackTypeBreakdown.jsx
      TopThreatenedDevices.jsx
      RecentAlertFeed.jsx
    alerts/
      AlertTable.jsx
      AlertRow.jsx
      AlertDetailDrawer.jsx
      AcknowledgeButton.jsx
      FilterBar.jsx
      AlertBurst.jsx
    devices/
      DeviceGrid.jsx
      DeviceCard.jsx
      DeviceTimeline.jsx
      VendorBadge.jsx
    shared/
      SeverityBadge.jsx
      AlertTypeBadge.jsx
      TimeAgo.jsx
      ToastContainer.jsx
  App.jsx
  main.jsx
  index.css
```

---

## State Architecture

### `useAlertStream.js`
- Holds WS ref (not state) to avoid re-render loops
- Reconnects with exponential backoff: 1s → 2s → 4s → max 30s
- Exposes `{ status: 'connected' | 'reconnecting' | 'disconnected', lastEvent }`

### `useAlerts.js`
- Fetches `GET /api/alerts?limit=100` on mount
- Prepends WS events; deduplicates by `id`
- Optimistic acknowledge: sets `acknowledged: true` locally, rolls back on error

### `useAlertStats.js`
All `useMemo` over alerts array — zero extra API calls:
```
{ threatScore, byType, bySeverity, unacknowledgedCount, hourlyBuckets, topDevices, burstDetection }
```

### `useDevices.js`
- Polls `GET /api/devices` on mount + every 30s
- Exposes both `devices[]` and `deviceMap` (Map<mac, Device>) for O(1) alert enrichment

---

## Static Alert Type Data — `src/data/alertTypes.js`

```js
export const ALERT_TYPE_META = {
  ARP_SPOOF: {
    label: 'ARP Spoofing',
    color: '#f97316',
    brief: 'Attacker is poisoning ARP tables to redirect traffic through their device.',
    responseSteps: [...],
    mitreTechnique: 'T1557.002',
  },
  DEAUTH_FLOOD:  { ... },
  EVIL_TWIN_AP:  { ... },
  PORT_SCAN:     { ... },
}
```

---

## Build Order

| Step | What |
|---|---|
| 1 | Scaffold Vite, install deps, wire router, build AppShell + NavBar + LiveStatusDot + useAlertStream |
| 2 | api layer (devicesApi, alertsApi), useDevices, useAlerts hooks |
| 3 | AlertsPage — FilterBar, AlertTable, AlertDetailDrawer, ToastContainer, AlertBurst |
| 4 | DashboardPage — useAlertStats, all 5 stat/chart components |
| 5 | DevicesPage — DeviceGrid, DeviceCard, DeviceTimeline, VendorBadge |
| 6 | Polish — keyboard nav, responsive breakpoints |

---

## Backend Endpoints Used

| Endpoint | Hook |
|---|---|
| `GET /api/devices` | useDevices |
| `GET /api/alerts?skip&limit` | useAlerts |
| `PATCH /api/alerts/{id}/acknowledge` | AcknowledgeButton |
| `WS /ws/alerts` | useAlertStream |

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev      # serves on http://localhost:5173
```

Make sure the backend is running (`make start` or `docker compose up`) so API calls succeed.
