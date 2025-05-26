"use client"

import { useState, useEffect } from "react"
import { ImageIcon, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WordVisualizationProps {
  word: string
  language: string
  onImageGenerated?: (imageUrl: string) => void
}

// Заглушка для генерации изображений
const generateMockImage = async (word: string): Promise<string> => {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Возвращаем URL заглушки с текстом
  const encodedWord = encodeURIComponent(word)
  return `https://via.placeholder.com/300x200/6366f1/ffffff?text=${encodedWord}`
}

export function WordVisualization({ word, language, onImageGenerated }: WordVisualizationProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateImage = async () => {
    if (!word.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const url = await generateMockImage(word.trim())
      setImageUrl(url)
      onImageGenerated?.(url)
    } catch (err) {
      setError("Ошибка при генерации изображения")
      console.error("Image generation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (word.trim()) {
      generateImage()
    } else {
      setImageUrl(null)
      setError(null)
    }
  }, [word])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5" />
          Визуальная ассоциация
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Область изображения */}
          <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Генерируем изображение...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={`Визуализация для "${word}"`}
                className="w-full h-full object-cover"
                onError={() => setError("Ошибка загрузки изображения")}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Изображение появится после перевода
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Кнопка обновления */}
          {word.trim() && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateImage}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Генерируем...' : 'Создать новое изображение'}
            </Button>
          )}

          {/* Информация */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              🎨 <strong>Заглушка:</strong> В финальной версии здесь будет интеграция с DALL-E API
            </p>
            <p>
              💡 Изображения помогают создавать визуальные ассоциации для лучшего запоминания слов
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
