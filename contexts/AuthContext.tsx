import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { authAPI } from '@/services/api'

interface AuthUser {
  _id: string
  name: string
  phone?: string
  email?: string
  role: 'customer' | 'seller' | 'admin'
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  sendOtp: (phone: string) => Promise<{ devOtp?: string }>
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<{ isNewUser: boolean }>
  logout: () => Promise<void>
  updateUser: (data: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on app start
    ;(async () => {
      try {
        const stored = await SecureStore.getItemAsync('auth-token')
        if (stored) {
          setToken(stored)
          const res = await authAPI.getMe()
          setUser(res.data.data)
        }
      } catch {
        await SecureStore.deleteItemAsync('auth-token')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function sendOtp(phone: string) {
    const res = await authAPI.sendOtp(phone)
    return { devOtp: res.data.devOtp }
  }

  async function verifyOtp(phone: string, otp: string, name?: string) {
    const res = await authAPI.verifyOtp(phone, otp, name)
    const { token: jwt, data, isNewUser } = res.data
    await SecureStore.setItemAsync('auth-token', jwt)
    setToken(jwt)
    setUser(data)
    return { isNewUser }
  }

  async function logout() {
    await SecureStore.deleteItemAsync('auth-token')
    setToken(null)
    setUser(null)
  }

  function updateUser(data: Partial<AuthUser>) {
    setUser((prev) => (prev ? { ...prev, ...data } : null))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, sendOtp, verifyOtp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
