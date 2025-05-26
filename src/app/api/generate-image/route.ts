import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting (простая реализация в памяти)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60000 // 1 минута
  const maxRequests = 10 // максимум 10 запросов в минуту

  const current = rateLimitMap.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Проверка API ключа
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Rate limiting
    const ip = request.ip || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { prompt, style = 'cartoon', size = '512x512', quality = 'standard' } = body

    // Валидация входных данных
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Валидация размера
    const validSizes = ['256x256', '512x512', '1024x1024']
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { error: 'Invalid size. Must be 256x256, 512x512, or 1024x1024' },
        { status: 400 }
      )
    }

    // Улучшение промпта с учетом стиля
    const enhancedPrompt = enhancePromptWithStyle(prompt, style)

    // Генерация изображения через DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: size as "256x256" | "512x512" | "1024x1024",
      quality: quality as "standard" | "hd",
      response_format: "url"
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: imageUrl,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      style,
      size,
      quality,
      generatedAt: Date.now()
    })

  } catch (error: any) {
    console.error('DALL-E API Error:', error)

    // Обработка специфичных ошибок OpenAI
    if (error?.error?.code === 'content_policy_violation') {
      return NextResponse.json(
        { error: 'Content policy violation. Please try a different prompt.' },
        { status: 400 }
      )
    }

    if (error?.error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    if (error?.error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI quota exceeded. Please check your billing.' },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Функция для улучшения промпта с учетом стиля
function enhancePromptWithStyle(prompt: string, style: string): string {
  const stylePrompts = {
    realistic: `A high-quality, realistic photograph of ${prompt}, clear and detailed`,
    cartoon: `A colorful, friendly cartoon illustration of ${prompt}, educational and appealing style, suitable for language learning`,
    minimalist: `A clean, minimalist illustration of ${prompt}, simple lines and shapes, modern design`,
    artistic: `An artistic, creative interpretation of ${prompt}, beautiful and inspiring, suitable for educational purposes`
  }

  const basePrompt = stylePrompts[style as keyof typeof stylePrompts] || prompt
  
  // Добавляем общие улучшения для образовательного контента
  return `${basePrompt}, high quality, well-lit, clear subject, educational content, safe for all ages`
}

// GET метод для проверки статуса API
export async function GET() {
  const isConfigured = !!process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    configured: isConfigured,
    model: 'dall-e-3',
    supportedSizes: ['256x256', '512x512', '1024x1024'],
    supportedStyles: ['realistic', 'cartoon', 'minimalist', 'artistic']
  })
}
