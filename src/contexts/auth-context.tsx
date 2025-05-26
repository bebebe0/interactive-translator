"use client"

import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Проверка сохраненного пользователя при загрузке
  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  // Заглушка для входа
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // В будущем здесь будет интеграция с Supabase Auth
      const mockUser: User = {
        id: 'mock-user-' + Date.now(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      throw new Error('Ошибка входа')
    } finally {
      setIsLoading(false)
    }
  }

  // Заглушка для регистрации
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // В будущем здесь будет интеграция с Supabase Auth
      const mockUser: User = {
        id: 'mock-user-' + Date.now(),
        email,
        name,
        createdAt: new Date().toISOString()
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      throw new Error('Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  // Выход из системы
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    
    // Очистка других данных пользователя при необходимости
    // localStorage.removeItem('translation-history')
    // localStorage.removeItem('study-cards')
  }

  // Обновление профиля
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('Пользователь не авторизован')
    
    setIsLoading(true)
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      throw new Error('Ошибка обновления профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
