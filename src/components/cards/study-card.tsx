"use client"

import { useState } from "react"
import { Eye, EyeOff, Trash2, RotateCcw, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type StudyCard } from "@/lib/local-storage"

interface StudyCardProps {
  card: StudyCard
  onDelete: (cardId: string) => void
  onReview: (cardId: string, difficulty: StudyCard['difficulty']) => void
  showActions?: boolean
}

export function StudyCardComponent({ 
  card, 
  onDelete, 
  onReview, 
  showActions = true 
}: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: StudyCard['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDifficultyLabel = (difficulty: StudyCard['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Легко'
      case 'medium': return 'Средне'
      case 'hard': return 'Сложно'
      default: return 'Неизвестно'
    }
  }

  const handleReview = (difficulty: StudyCard['difficulty']) => {
    onReview(card.id, difficulty)
    setIsFlipped(false)
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium">
            {card.originalText}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(card.difficulty)}`}>
              {getDifficultyLabel(card.difficulty)}
            </span>
            
            {showActions && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="h-8 w-8"
                >
                  {isFlipped ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {card.sourceLanguage.toUpperCase()} → {card.targetLanguage.toUpperCase()}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Изображение */}
        {card.imageUrl && (
          <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden">
            <img
              src={card.imageUrl}
              alt={`Визуализация для "${card.originalText}"`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Перевод */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Перевод:</span>
            {!isFlipped && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFlipped(true)}
                className="text-xs"
              >
                Показать
              </Button>
            )}
          </div>
          
          {isFlipped ? (
            <p className="text-lg font-medium">{card.translatedText}</p>
          ) : (
            <div className="h-7 bg-muted rounded flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Нажмите, чтобы увидеть перевод</span>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Создано: {formatDate(card.createdAt)}</span>
          <span>Повторений: {card.reviewCount}</span>
        </div>

        {/* Кнопки оценки (показываются только при просмотре перевода) */}
        {isFlipped && showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview('hard')}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              Сложно
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview('medium')}
              className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
            >
              Средне
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview('easy')}
              className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
            >
              Легко
            </Button>
          </div>
        )}
      </CardContent>

      {/* Подтверждение удаления */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4 p-4">
            <p className="font-medium">Удалить карточку?</p>
            <p className="text-sm text-muted-foreground">Это действие нельзя отменить</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(card.id)
                  setShowDeleteConfirm(false)
                }}
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
