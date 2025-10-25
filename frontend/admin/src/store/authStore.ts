import { create } from 'zustand'
import axiosInstance from '@/lib/axios'

interface Admin {
  id: number
  name: string
  email: string
}

interface AuthState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: JSON.parse(localStorage.getItem('admin') || 'null'),
  token: localStorage.getItem('adminToken'),
  isAuthenticated: !!localStorage.getItem('adminToken'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await axiosInstance.post('/login', { email, password })
      const { access_token, admin } = response.data

      localStorage.setItem('adminToken', access_token)
      localStorage.setItem('admin', JSON.stringify(admin))

      set({
        admin,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    set({
      admin: null,
      token: null,
      isAuthenticated: false,
    })
    window.location.href = '/login'
  },

  checkAuth: () => {
    const token = localStorage.getItem('adminToken')
    const admin = localStorage.getItem('admin')
    if (token && admin) {
      set({
        token,
        admin: JSON.parse(admin),
        isAuthenticated: true,
      })
    } else {
      set({
        token: null,
        admin: null,
        isAuthenticated: false,
      })
    }
  },
}))


