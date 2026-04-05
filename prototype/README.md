# Project 2 Prototype — WiFi Security Monitor

## What This Is
A static UI/Visual prototype of the WiFi Security Monitor dashboard.
No backend, no server, no install needed — just open in a browser.

## How to Open
Double-click `dashboard.html` — that's it.

## Pages
| File | Page |
|---|---|
| `dashboard.html` | Dashboard — threat meter, charts, live feed |
| `alerts.html` | Alerts — table, filters, detail drawer |
| `devices.html` | Devices — device cards, timelines |

## What's Interactive
- Navigation between all 3 pages
- Clicking any alert row opens the detail drawer (slide-in panel)
- Drawer shows device info, attack brief, MITRE reference, response steps
- Acknowledge button works (marks row as acknowledged)
- Filter pills are clickable (visual only — data doesn't filter in prototype)
- Device timeline toggle (show/hide)
- Copy JSON button

## What's Fake
All data is hardcoded — no real WiFi packets, no real backend.
This is a prototype to visualise and test the design only.
