"use client"

import { useState } from "react"
import { ArrowRightLeft, Loader2, Volume2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSelector, languages, type Language } from "./language-selector"
import { WordVisualization } from "./word-visualization"
import { translateText, type TranslationResult } from "@/lib/translation-api"
import { addToTranslationHistory, addStudyCard } from "@/lib/local-storage"

export function TranslatorInterface() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[0]) // Английский
  const [targetLanguage, setTargetLanguage] = useState<Language>(languages[5]) // Русский
  const [inputText, setInputText] = useState("")
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await translateText(
        inputText.trim(),
        sourceLanguage.code,
        targetLanguage.code
      )
      setTranslationResult(result)

      // Сохраняем в историю переводов
      addToTranslationHistory({
        originalText: result.originalText,
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        confidence: result.confidence
      })
    } catch (err) {
      setError("Ошибка при переводе. Попробуйте еще раз.")
      console.error("Translation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwapLanguages = () => {
    if (targetLanguage.code === "ru") return // Не меняем, если целевой язык русский

    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setInputText(translationResult?.translatedText || "")
    setTranslationResult(null)
  }

  const handleCreateCard = () => {
    if (!translationResult) return

    try {
      const card = addStudyCard({
        originalText: translationResult.originalText,
        translatedText: translationResult.translatedText,
        sourceLanguage: translationResult.sourceLanguage,
        targetLanguage: translationResult.targetLanguage,
        imageUrl: generatedImageUrl || undefined,
        difficulty: 'medium'
      })

      alert(`Карточка создана: ${card.originalText} - ${card.translatedText}`)
    } catch (error) {
      alert("Карточка уже существует или произошла ошибка")
    }
  }

  return (
    <div className="space-y-6">
      {/* Селекторы языков */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <LanguageSelector
          selectedLanguage={sourceLanguage}
          onLanguageChange={setSourceLanguage}
          label="Исходный язык"
        />

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapLanguages}
            disabled={targetLanguage.code === "ru"}
            className="rounded-full"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        <LanguageSelector
          selectedLanguage={targetLanguage}
          onLanguageChange={setTargetLanguage}
          label="Целевой язык"
        />
      </div>

      {/* Область ввода и перевода */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ввод текста */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Введите текст</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Введите слово или фразу для перевода..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleTranslate()
                }
              }}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Переводим...
                  </>
                ) : (
                  "Перевести"
                )}
              </Button>

              <Button variant="outline" size="icon" disabled>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Результат перевода */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Перевод</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[120px] p-3 bg-muted rounded-md">
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : translationResult ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {translationResult.translatedText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Уверенность: {Math.round(translationResult.confidence * 100)}%
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Результат перевода появится здесь
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCreateCard}
                disabled={!translationResult}
                className="flex-1"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Создать карточку
              </Button>

              <Button variant="outline" size="icon" disabled>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Визуализация слова */}
        {translationResult && (
          <WordVisualization
            word={translationResult.originalText}
            language={sourceLanguage.code}
            onImageGenerated={setGeneratedImageUrl}
          />
        )}
      </div>

      {/* Дополнительная информация */}
      {translationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Дополнительная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {translationResult.examples && translationResult.examples.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Примеры использования:</h4>
                <ul className="space-y-1">
                  {translationResult.examples.map((example, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {translationResult.synonyms && translationResult.synonyms.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Синонимы:</h4>
                <div className="flex flex-wrap gap-2">
                  {translationResult.synonyms.map((synonym, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {synonym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
