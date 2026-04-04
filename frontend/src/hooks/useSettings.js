import { useState, useEffect } from 'react'
import { fetchSettings, updateSettings } from '../api/settingsApi.js'

export function useSettings() {
  const [autoBlock, setAutoBlockState] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
      .then(data => setAutoBlockState(data.auto_block_enabled))
      .finally(() => setLoading(false))
  }, [])

  async function setAutoBlock(enabled) {
    setAutoBlockState(enabled)
    try {
      await updateSettings({ auto_block_enabled: enabled })
    } catch {
      setAutoBlockState(!enabled)
    }
  }

  return { autoBlock, setAutoBlock, loading }
}
