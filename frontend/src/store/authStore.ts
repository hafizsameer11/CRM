import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  name: string
  email: string
  role: 'owner' | 'manager' | 'agent'
  tenant_id: number
}

interface Tenant {
  id: number
  name: string
  slug: string
  email: string
  status: 'active' | 'restricted' | 'suspended'
}

interface AuthState {
  user: User | null
  tenant: Tenant | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
  setTenant: (tenant: Tenant) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => {
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        set({ token: null, user: null, tenant: null, isAuthenticated: false })
      },
      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

