import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function TimeAgo({ timestamp, style }) {
  const [label, setLabel] = useState('')

  function update() {
    if (!timestamp) { setLabel('—'); return }
    try {
      setLabel(formatDistanceToNow(new Date(timestamp), { addSuffix: true }))
    } catch {
      setLabel('—')
    }
  }

  useEffect(() => {
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [timestamp])

  return <span style={{ color: 'var(--text-secondary)', fontSize: 12, ...style }}>{label}</span>
}
