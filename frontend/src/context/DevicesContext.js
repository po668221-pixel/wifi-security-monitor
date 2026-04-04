import { createContext, useContext } from 'react'

export const DevicesContext = createContext(null)
export const useDevicesContext = () => useContext(DevicesContext)
