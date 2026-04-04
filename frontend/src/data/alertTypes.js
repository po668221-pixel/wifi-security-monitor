export const ALERT_TYPE_META = {
  ARP_SPOOF: {
    label: 'ARP Spoofing',
    color: '#f97316',
    icon: '↔',
    brief: 'An attacker is broadcasting fake ARP replies to poison ARP caches on the network, redirecting traffic through their machine (man-in-the-middle).',
    responseSteps: [
      'Identify the spoofing device MAC in the alert details',
      'Cross-reference with the Devices page — is this a known device?',
      'Physically locate and disconnect the rogue device',
      'Enable Dynamic ARP Inspection (DAI) on managed switches',
      'Consider static ARP entries for critical infrastructure',
    ],
    mitreTechnique: 'T1557.002',
    mitreUrl: 'https://attack.mitre.org/techniques/T1557/002/',
  },
  DEAUTH_FLOOD: {
    label: 'Deauth Flood',
    color: '#f97316',
    icon: '⚡',
    brief: 'A flood of 802.11 deauthentication frames is being sent, forcibly disconnecting clients from the network. This is commonly used as a precursor to an evil twin or credential capture attack.',
    responseSteps: [
      'Identify the BSSID sending deauth frames from the alert details',
      'Compare against your known AP list on the Devices page',
      'Check if clients are being dropped from your legitimate AP',
      'Enable Management Frame Protection (802.11w) on your access point',
      'Consider switching to a 5GHz-only network (harder to attack)',
    ],
    mitreTechnique: 'T1498',
    mitreUrl: 'https://attack.mitre.org/techniques/T1498/',
  },
  EVIL_TWIN_AP: {
    label: 'Evil Twin AP',
    color: '#ef4444',
    icon: '👁',
    brief: 'A rogue access point is broadcasting the same SSID as your legitimate network with a different BSSID. Clients may connect to it, exposing credentials and traffic.',
    responseSteps: [
      'Immediately identify the rogue BSSID from the alert details',
      'Use a WiFi scanner to physically locate the rogue AP',
      'Warn network users not to connect to the duplicate SSID',
      'Alert clients currently connected to re-verify their AP',
      'Enable AP isolation and BSSID whitelisting if your infrastructure supports it',
    ],
    mitreTechnique: 'T1557',
    mitreUrl: 'https://attack.mitre.org/techniques/T1557/',
  },
  PORT_SCAN: {
    label: 'Port Scan',
    color: '#3b82f6',
    icon: '🔍',
    brief: 'A device is probing a large number of ports on the network in a short time window — reconnaissance activity that often precedes a targeted attack.',
    responseSteps: [
      'Identify the source IP from the alert details',
      'Cross-reference on the Devices page — is this a known device?',
      'Check if the source is an authorised network scanner (e.g. Nessus, Nmap scheduled scan)',
      'If unknown, isolate the device and investigate',
      'Review firewall rules to ensure unnecessary ports are not exposed',
    ],
    mitreTechnique: 'T1046',
    mitreUrl: 'https://attack.mitre.org/techniques/T1046/',
  },
}

export const SEVERITY_META = {
  CRITICAL: { color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)', label: 'Critical' },
  HIGH:     { color: '#f97316', bgColor: 'rgba(249,115,22,0.15)', label: 'High' },
  MEDIUM:   { color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)', label: 'Medium' },
  LOW:      { color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)',  label: 'Low' },
}
