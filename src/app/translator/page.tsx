import { Navigation } from "@/components/navigation"
import { TranslatorInterface } from "@/components/translator/translator-interface"

export default function TranslatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Переводчик</h1>
            <p className="text-muted-foreground">
              Переводите слова и фразы на 5 языков с поддержкой визуальных ассоциаций
            </p>
          </div>

          <TranslatorInterface />
        </div>
      </main>
    </div>
  )
}
