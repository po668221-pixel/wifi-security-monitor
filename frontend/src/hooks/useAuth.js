import { useState } from 'react'
import { login as apiLogin, logout as apiLogout, isLoggedIn } from '../api/authApi.js'

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  async function login(username, password) {
    await apiLogin(username, password)
    setLoggedIn(true)
  }

  function logout() {
    apiLogout()
    setLoggedIn(false)
  }

  return { loggedIn, login, logout }
}
