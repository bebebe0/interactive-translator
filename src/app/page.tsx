import Link from "next/link"
import { Languages, BookOpen, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Интерактивный переводчик
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Изучайте языки с помощью визуальных ассоциаций. Переводите слова, создавайте карточки и запоминайте эффективно.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/translator">
                <Languages className="mr-2 h-4 w-4" />
                Начать перевод
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/cards">
                <BookOpen className="mr-2 h-4 w-4" />
                Мои карточки
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Быстрый перевод
              </CardTitle>
              <CardDescription>
                Переводите слова и фразы на 5 языков с мгновенным результатом
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Поддержка английского, испанского, французского, немецкого и китайского языков
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Визуальные ассоциации
              </CardTitle>
              <CardDescription>
                Автоматическая генерация изображений для лучшего запоминания
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Каждое слово сопровождается релевантным изображением для создания визуальной связи
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Система карточек
              </CardTitle>
              <CardDescription>
                Создавайте карточки и повторяйте слова по системе интервального повторения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Эффективная методика запоминания с отслеживанием прогресса обучения
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
