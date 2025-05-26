// Сервис для генерации изображений с DALL-E API

export interface ImageGenerationOptions {
  prompt: string
  style?: 'realistic' | 'cartoon' | 'minimalist' | 'artistic'
  size?: '256x256' | '512x512' | '1024x1024'
  quality?: 'standard' | 'hd'
}

export interface GeneratedImage {
  url: string
  prompt: string
  style: string
  size: string
  generatedAt: number
}

// Реальная интеграция с DALL-E API
class ImageGenerationService {
  private baseUrl = '/api/generate-image'

  constructor() {
    // API ключ хранится на сервере для безопасности
  }

  // Проверка доступности API
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, { method: 'GET' })
      const data = await response.json()
      return data.configured === true
    } catch {
      return false
    }
  }

  // Генерация изображения через DALL-E API
  async generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    const { prompt, style = 'cartoon', size = '512x512', quality = 'standard' } = options

    try {
      // Проверяем доступность API
      const isApiAvailable = await this.isAvailable()

      if (!isApiAvailable) {
        console.warn('DALL-E API not available, using placeholder')
        return this.generatePlaceholderImage(prompt, style, size)
      }

      // Отправляем запрос к нашему API route
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          size,
          quality
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      return {
        url: data.url,
        prompt: data.prompt,
        style,
        size,
        generatedAt: data.generatedAt
      }
    } catch (error) {
      console.error('Error generating image with DALL-E:', error)
      // Fallback на placeholder
      return this.generatePlaceholderImage(prompt, style, size)
    }
  }

  // Удалена заглушка - теперь используем реальный API

  // Генерация placeholder изображения
  private generatePlaceholderImage(prompt: string, style: string, size: string): GeneratedImage {
    const encodedPrompt = encodeURIComponent(prompt)
    const [width, height] = size.split('x').map(Number)

    // Цвета для разных стилей
    const styleColors = {
      realistic: '6366f1/ffffff',
      cartoon: 'f59e0b/ffffff',
      minimalist: '64748b/ffffff',
      artistic: 'ec4899/ffffff'
    }

    const colorScheme = styleColors[style as keyof typeof styleColors] || '6366f1/ffffff'

    return {
      url: `https://via.placeholder.com/${width}x${height}/${colorScheme}?text=${encodedPrompt}`,
      prompt,
      style,
      size,
      generatedAt: Date.now()
    }
  }

  // Генерация изображения для слова с контекстом языка
  async generateWordImage(
    word: string,
    language: string,
    context?: string
  ): Promise<GeneratedImage> {
    // Формирование промпта с учетом языка и контекста
    let prompt = word

    if (context) {
      prompt = `${word} (${context})`
    }

    // Добавление языкового контекста для лучшего понимания
    const languageContext = {
      'en': 'English word',
      'es': 'Spanish word',
      'fr': 'French word',
      'de': 'German word',
      'zh': 'Chinese word',
      'ru': 'Russian word'
    }

    const langContext = languageContext[language as keyof typeof languageContext]
    if (langContext) {
      prompt = `${prompt}, ${langContext} concept`
    }

    return this.generateImage({
      prompt,
      style: 'cartoon', // Мультяшный стиль лучше для обучения
      size: '512x512'
    })
  }

  // Пакетная генерация изображений
  async generateBatch(words: string[], language: string): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = []

    // Генерируем по одному изображению с задержкой для избежания rate limiting
    for (const word of words) {
      try {
        const image = await this.generateWordImage(word, language)
        results.push(image)

        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error generating image for word "${word}":`, error)
      }
    }

    return results
  }

  // Сохранение изображения в локальное хранилище (для кэширования)
  cacheImage(image: GeneratedImage): void {
    try {
      const cacheKey = `image_cache_${image.prompt}_${image.style}_${image.size}`
      const cacheData = {
        ...image,
        cachedAt: Date.now()
      }

      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error caching image:', error)
    }
  }

  // Получение изображения из кэша
  getCachedImage(prompt: string, style: string, size: string): GeneratedImage | null {
    try {
      const cacheKey = `image_cache_${prompt}_${style}_${size}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const cacheData = JSON.parse(cached)

        // Проверяем, не устарел ли кэш (24 часа)
        const maxAge = 24 * 60 * 60 * 1000
        if (Date.now() - cacheData.cachedAt < maxAge) {
          return cacheData
        } else {
          localStorage.removeItem(cacheKey)
        }
      }
    } catch (error) {
      console.error('Error reading cached image:', error)
    }

    return null
  }
}

// Экспорт singleton instance
export const imageGenerationService = new ImageGenerationService()

// Хелпер функции
export const generateWordVisualization = async (
  word: string,
  language: string = 'en'
): Promise<GeneratedImage> => {
  // Сначала проверяем кэш
  const cached = imageGenerationService.getCachedImage(word, 'cartoon', '512x512')
  if (cached) {
    return cached
  }

  // Генерируем новое изображение
  const image = await imageGenerationService.generateWordImage(word, language)

  // Кэшируем результат
  imageGenerationService.cacheImage(image)

  return image
}

// Конфигурация для разных типов слов
export const getImageStyleForWord = (word: string, partOfSpeech?: string): ImageGenerationOptions['style'] => {
  // Существительные - реалистичный стиль
  if (partOfSpeech === 'noun') {
    return 'realistic'
  }

  // Действия - мультяшный стиль
  if (partOfSpeech === 'verb') {
    return 'cartoon'
  }

  // Абстрактные понятия - художественный стиль
  if (partOfSpeech === 'adjective' || partOfSpeech === 'abstract') {
    return 'artistic'
  }

  // По умолчанию - мультяшный стиль для обучения
  return 'cartoon'
}
`
