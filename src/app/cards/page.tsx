import { Navigation } from "@/components/navigation"
import { CardsInterface } from "@/components/cards/cards-interface"

export default function CardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Мои карточки</h1>
            <p className="text-muted-foreground">
              Изучайте слова с помощью системы интервального повторения
            </p>
          </div>

          <CardsInterface />
        </div>
      </main>
    </div>
  )
}
