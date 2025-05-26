"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Language {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "en", name: "Английский", flag: "🇺🇸" },
  { code: "es", name: "Испанский", flag: "🇪🇸" },
  { code: "fr", name: "Французский", flag: "🇫🇷" },
  { code: "de", name: "Немецкий", flag: "🇩🇪" },
  { code: "zh", name: "Китайский", flag: "🇨🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
]

interface LanguageSelectorProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  label: string
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  label 
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedLanguage.flag}</span>
              {selectedLanguage.name}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => onLanguageChange(language)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                {language.name}
              </span>
              {selectedLanguage.code === language.code && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
