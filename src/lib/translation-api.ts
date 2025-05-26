// Заглушка API для перевода
// В будущем здесь будет интеграция с реальным API перевода

export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
  examples?: string[]
  synonyms?: string[]
}

// Словарь для демонстрации
const mockTranslations: Record<string, Record<string, string>> = {
  en: {
    hello: "привет",
    world: "мир",
    cat: "кот",
    dog: "собака",
    house: "дом",
    car: "машина",
    book: "книга",
    water: "вода",
    food: "еда",
    love: "любовь",
    friend: "друг",
    family: "семья",
    work: "работа",
    school: "школа",
    beautiful: "красивый",
    happy: "счастливый",
    good: "хороший",
    bad: "плохой",
    big: "большой",
    small: "маленький"
  },
  es: {
    hola: "привет",
    mundo: "мир",
    gato: "кот",
    perro: "собака",
    casa: "дом",
    coche: "машина",
    libro: "книга",
    agua: "вода",
    comida: "еда",
    amor: "любовь",
    amigo: "друг",
    familia: "семья",
    trabajo: "работа",
    escuela: "школа",
    hermoso: "красивый",
    feliz: "счастливый",
    bueno: "хороший",
    malo: "плохой",
    grande: "большой",
    pequeño: "маленький"
  },
  fr: {
    bonjour: "привет",
    monde: "мир",
    chat: "кот",
    chien: "собака",
    maison: "дом",
    voiture: "машина",
    livre: "книга",
    eau: "вода",
    nourriture: "еда",
    amour: "любовь",
    ami: "друг",
    famille: "семья",
    travail: "работа",
    école: "школа",
    beau: "красивый",
    heureux: "счастливый",
    bon: "хороший",
    mauvais: "плохой",
    grand: "большой",
    petit: "маленький"
  },
  de: {
    hallo: "привет",
    welt: "мир",
    katze: "кот",
    hund: "собака",
    haus: "дом",
    auto: "машина",
    buch: "книга",
    wasser: "вода",
    essen: "еда",
    liebe: "любовь",
    freund: "друг",
    familie: "семья",
    arbeit: "работа",
    schule: "школа",
    schön: "красивый",
    glücklich: "счастливый",
    gut: "хороший",
    schlecht: "плохой",
    groß: "большой",
    klein: "маленький"
  },
  zh: {
    你好: "привет",
    世界: "мир",
    猫: "кот",
    狗: "собака",
    房子: "дом",
    汽车: "машина",
    书: "книга",
    水: "вода",
    食物: "еда",
    爱: "любовь",
    朋友: "друг",
    家庭: "семья",
    工作: "работа",
    学校: "школа",
    美丽: "красивый",
    快乐: "счастливый",
    好: "хороший",
    坏: "плохой",
    大: "большой",
    小: "маленький"
  }
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

  const normalizedText = text.toLowerCase().trim()
  
  // Поиск в словаре
  const translations = mockTranslations[sourceLanguage]
  let translatedText = translations?.[normalizedText]

  // Если перевод не найден, используем заглушку
  if (!translatedText) {
    translatedText = `[Перевод: ${text}]`
  }

  return {
    originalText: text,
    translatedText,
    sourceLanguage,
    targetLanguage,
    confidence: translatedText.startsWith('[') ? 0.3 : 0.95,
    examples: [
      `Пример 1: ${text} в контексте`,
      `Пример 2: Использование ${text}`
    ],
    synonyms: translatedText.startsWith('[') ? [] : ['синоним1', 'синоним2']
  }
}
