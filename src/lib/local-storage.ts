// Утилиты для работы с локальным хранилищем

export interface TranslationHistory {
  id: string
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  timestamp: number
  confidence: number
}

export interface StudyCard {
  id: string
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  imageUrl?: string
  createdAt: number
  lastReviewed?: number
  reviewCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  nextReview: number
}

const TRANSLATION_HISTORY_KEY = 'translation-history'
const STUDY_CARDS_KEY = 'study-cards'

// История переводов
export function getTranslationHistory(): TranslationHistory[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(TRANSLATION_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading translation history:', error)
    return []
  }
}

export function addToTranslationHistory(translation: Omit<TranslationHistory, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return

  try {
    const history = getTranslationHistory()
    const newEntry: TranslationHistory = {
      ...translation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
    
    // Добавляем в начало и ограничиваем до 100 записей
    const updatedHistory = [newEntry, ...history].slice(0, 100)
    localStorage.setItem(TRANSLATION_HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error('Error saving translation history:', error)
  }
}

export function clearTranslationHistory(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(TRANSLATION_HISTORY_KEY)
  } catch (error) {
    console.error('Error clearing translation history:', error)
  }
}

// Карточки для изучения
export function getStudyCards(): StudyCard[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STUDY_CARDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading study cards:', error)
    return []
  }
}

export function addStudyCard(card: Omit<StudyCard, 'id' | 'createdAt' | 'reviewCount' | 'nextReview'>): StudyCard {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage on server')
  }

  try {
    const cards = getStudyCards()
    
    // Проверяем, не существует ли уже такая карточка
    const existingCard = cards.find(c => 
      c.originalText.toLowerCase() === card.originalText.toLowerCase() &&
      c.sourceLanguage === card.sourceLanguage &&
      c.targetLanguage === card.targetLanguage
    )
    
    if (existingCard) {
      return existingCard
    }
    
    const newCard: StudyCard = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      reviewCount: 0,
      nextReview: Date.now() + (24 * 60 * 60 * 1000) // Следующий просмотр через 24 часа
    }
    
    const updatedCards = [newCard, ...cards]
    localStorage.setItem(STUDY_CARDS_KEY, JSON.stringify(updatedCards))
    
    return newCard
  } catch (error) {
    console.error('Error saving study card:', error)
    throw error
  }
}

export function updateStudyCard(cardId: string, updates: Partial<StudyCard>): void {
  if (typeof window === 'undefined') return

  try {
    const cards = getStudyCards()
    const cardIndex = cards.findIndex(c => c.id === cardId)
    
    if (cardIndex === -1) return
    
    cards[cardIndex] = { ...cards[cardIndex], ...updates }
    localStorage.setItem(STUDY_CARDS_KEY, JSON.stringify(cards))
  } catch (error) {
    console.error('Error updating study card:', error)
  }
}

export function deleteStudyCard(cardId: string): void {
  if (typeof window === 'undefined') return

  try {
    const cards = getStudyCards()
    const filteredCards = cards.filter(c => c.id !== cardId)
    localStorage.setItem(STUDY_CARDS_KEY, JSON.stringify(filteredCards))
  } catch (error) {
    console.error('Error deleting study card:', error)
  }
}

export function getCardsForReview(): StudyCard[] {
  const cards = getStudyCards()
  const now = Date.now()
  
  return cards.filter(card => card.nextReview <= now)
}

// Расчет следующего интервала повторения (алгоритм интервального повторения)
export function calculateNextReview(difficulty: StudyCard['difficulty'], reviewCount: number): number {
  const now = Date.now()
  const baseIntervals = {
    easy: [1, 3, 7, 14, 30, 60], // дни
    medium: [1, 2, 5, 10, 21, 45],
    hard: [1, 1, 3, 7, 14, 30]
  }
  
  const intervals = baseIntervals[difficulty]
  const intervalIndex = Math.min(reviewCount, intervals.length - 1)
  const daysToAdd = intervals[intervalIndex]
  
  return now + (daysToAdd * 24 * 60 * 60 * 1000)
}
