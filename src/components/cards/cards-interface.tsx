"use client"

import { useState, useEffect } from "react"
import { BookOpen, Plus, Filter, Search, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StudyCardComponent } from "./study-card"
import {
  getStudyCards,
  getCardsForReview,
  updateStudyCard,
  deleteStudyCard,
  calculateNextReview,
  type StudyCard
} from "@/lib/local-storage"

export function CardsInterface() {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [filteredCards, setFilteredCards] = useState<StudyCard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [showReviewOnly, setShowReviewOnly] = useState(false)

  // Загрузка карточек
  const loadCards = () => {
    const allCards = getStudyCards()
    setCards(allCards)
  }

  useEffect(() => {
    loadCards()
  }, [])

  // Фильтрация карточек
  useEffect(() => {
    let filtered = cards

    // Фильтр по поиску
    if (searchQuery.trim()) {
      filtered = filtered.filter(card =>
        card.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Фильтр по сложности
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(card => card.difficulty === difficultyFilter)
    }

    // Фильтр по языку
    if (languageFilter !== "all") {
      filtered = filtered.filter(card => card.sourceLanguage === languageFilter)
    }

    // Фильтр для повторения
    if (showReviewOnly) {
      const reviewCards = getCardsForReview()
      const reviewIds = new Set(reviewCards.map(c => c.id))
      filtered = filtered.filter(card => reviewIds.has(card.id))
    }

    setFilteredCards(filtered)
  }, [cards, searchQuery, difficultyFilter, languageFilter, showReviewOnly])

  // Обработка оценки карточки
  const handleReview = (cardId: string, difficulty: StudyCard['difficulty']) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return

    const newReviewCount = card.reviewCount + 1
    const nextReview = calculateNextReview(difficulty, newReviewCount)

    updateStudyCard(cardId, {
      difficulty,
      reviewCount: newReviewCount,
      lastReviewed: Date.now(),
      nextReview
    })

    loadCards()
  }

  // Удаление карточки
  const handleDelete = (cardId: string) => {
    deleteStudyCard(cardId)
    loadCards()
  }

  // Получение уникальных языков
  const getUniqueLanguages = () => {
    const languages = new Set(cards.map(card => card.sourceLanguage))
    return Array.from(languages)
  }

  const reviewCards = getCardsForReview()
  const stats = {
    total: cards.length,
    forReview: reviewCards.length,
    easy: cards.filter(c => c.difficulty === 'easy').length,
    medium: cards.filter(c => c.difficulty === 'medium').length,
    hard: cards.filter(c => c.difficulty === 'hard').length
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Всего карточек</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.forReview}</div>
            <div className="text-sm text-muted-foreground">К повторению</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.easy}</div>
            <div className="text-sm text-muted-foreground">Легкие</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <div className="text-sm text-muted-foreground">Средние</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
            <div className="text-sm text-muted-foreground">Сложные</div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры и поиск
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по словам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Сложность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все сложности</SelectItem>
                <SelectItem value="easy">Легкие</SelectItem>
                <SelectItem value="medium">Средние</SelectItem>
                <SelectItem value="hard">Сложные</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Язык" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все языки</SelectItem>
                {getUniqueLanguages().map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant={showReviewOnly ? "default" : "outline"}
              onClick={() => setShowReviewOnly(!showReviewOnly)}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {showReviewOnly ? "Все карточки" : "К повторению"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список карточек */}
      {filteredCards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {cards.length === 0 ? "Нет карточек" : "Карточки не найдены"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {cards.length === 0 
                ? "Создайте первую карточку в переводчике" 
                : "Попробуйте изменить фильтры поиска"
              }
            </p>
            {cards.length === 0 && (
              <Button asChild>
                <a href="/translator">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать карточку
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map(card => (
            <StudyCardComponent
              key={card.id}
              card={card}
              onDelete={handleDelete}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  )
}
