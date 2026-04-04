import { createContext, useContext } from 'react'

export const AlertsContext = createContext(null)
export const useAlertsContext = () => useContext(AlertsContext)
