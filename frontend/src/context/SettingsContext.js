import { createContext, useContext } from 'react'

export const SettingsContext = createContext(null)

export function useSettingsContext() {
  return useContext(SettingsContext)
}
