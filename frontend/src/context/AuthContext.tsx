import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { User, Artist } from '@/types'
import { allMockUsers } from '@/mock'

type CurrentUser = User | Artist | null

interface AuthContextType {
  currentUser: CurrentUser
  login: (email: string, password: string) => boolean
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(allMockUsers[0] || null)

  function login(email: string, password: string): boolean {
    if (password !== 'test123') return false
    const user = allMockUsers.find(u => u.email === email)
    if (!user) return false
    setCurrentUser(user)
    return true
  }

  function logout() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoggedIn: currentUser !== null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}