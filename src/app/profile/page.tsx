"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, BookOpen, Target, TrendingUp, Loader2 } from "lucide-react"
import { getStudyCards, getTranslationHistory } from "@/lib/local-storage"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  })
  const [isSaving, setIsSaving] = useState(false)

  // Статистика пользователя
  const cards = getStudyCards()
  const history = getTranslationHistory()

  const stats = {
    totalCards: cards.length,
    totalTranslations: history.length,
    reviewedToday: cards.filter(card => {
      const today = new Date().toDateString()
      return card.lastReviewed && new Date(card.lastReviewed).toDateString() === today
    }).length,
    streak: 7 // Заглушка для серии дней
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || ""
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Профиль</h1>
            <p className="text-muted-foreground mb-8">
              Войдите в систему для просмотра профиля
            </p>
            <Button asChild>
              <a href="/auth/login">Войти</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Профиль</h1>
            <p className="text-muted-foreground">
              Управляйте своим аккаунтом и отслеживайте прогресс обучения
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalCards}</div>
                <div className="text-sm text-muted-foreground">Карточек</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats.totalTranslations}</div>
                <div className="text-sm text-muted-foreground">Переводов</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{stats.reviewedToday}</div>
                <div className="text-sm text-muted-foreground">Сегодня</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Дней подряд</div>
              </CardContent>
            </Card>
          </div>

          {/* Информация о пользователе */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Информация о пользователе
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Имя</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ваше имя"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      type="email"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        "Сохранить"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">Имя пользователя</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Email адрес</p>
                    </div>
                  </div>

                  {user.createdAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-sm text-muted-foreground">Дата регистрации</p>
                      </div>
                    </div>
                  )}

                  <Button onClick={() => setIsEditing(true)}>
                    Редактировать профиль
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Заглушка для будущих функций */}
          <Card>
            <CardHeader>
              <CardTitle>Будущие функции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>🚧 <strong>В разработке:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Синхронизация данных с облаком (Supabase)</li>
                  <li>Детальная статистика обучения</li>
                  <li>Настройки уведомлений</li>
                  <li>Экспорт/импорт карточек</li>
                  <li>Достижения и награды</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
