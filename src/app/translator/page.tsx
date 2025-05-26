import { Navigation } from "@/components/navigation"

export default function TranslatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Переводчик</h1>
          
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">
              Здесь будет интерфейс переводчика с поддержкой 5 языков и генерацией изображений.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              🚧 В разработке - будет реализовано на следующем этапе
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
