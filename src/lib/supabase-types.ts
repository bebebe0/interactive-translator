// Типы данных для интеграции с Supabase
// Эти типы будут использоваться при подключении к реальной базе данных

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          created_at: string
          updated_at: string
          preferences: UserPreferences
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          preferences?: UserPreferences
        }
        Update: {
          email?: string
          name?: string
          avatar_url?: string
          preferences?: UserPreferences
        }
      }
      study_cards: {
        Row: {
          id: string
          user_id: string
          original_text: string
          translated_text: string
          source_language: string
          target_language: string
          image_url?: string
          difficulty: 'easy' | 'medium' | 'hard'
          review_count: number
          last_reviewed?: string
          next_review: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          original_text: string
          translated_text: string
          source_language: string
          target_language: string
          image_url?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          review_count?: number
          next_review?: string
        }
        Update: {
          original_text?: string
          translated_text?: string
          source_language?: string
          target_language?: string
          image_url?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          review_count?: number
          last_reviewed?: string
          next_review?: string
        }
      }
      translation_history: {
        Row: {
          id: string
          user_id: string
          original_text: string
          translated_text: string
          source_language: string
          target_language: string
          confidence: number
          created_at: string
        }
        Insert: {
          user_id: string
          original_text: string
          translated_text: string
          source_language: string
          target_language: string
          confidence: number
        }
        Update: {
          original_text?: string
          translated_text?: string
          source_language?: string
          target_language?: string
          confidence?: number
        }
      }
      learning_sessions: {
        Row: {
          id: string
          user_id: string
          cards_reviewed: number
          correct_answers: number
          session_duration: number
          created_at: string
        }
        Insert: {
          user_id: string
          cards_reviewed: number
          correct_answers: number
          session_duration: number
        }
        Update: {
          cards_reviewed?: number
          correct_answers?: number
          session_duration?: number
        }
      }
    }
    Views: {
      user_statistics: {
        Row: {
          user_id: string
          total_cards: number
          total_translations: number
          cards_reviewed_today: number
          current_streak: number
          longest_streak: number
          average_accuracy: number
        }
      }
    }
    Functions: {
      get_cards_for_review: {
        Args: {
          user_id: string
        }
        Returns: Database['public']['Tables']['study_cards']['Row'][]
      }
      update_card_review: {
        Args: {
          card_id: string
          difficulty: 'easy' | 'medium' | 'hard'
        }
        Returns: void
      }
    }
  }
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    review_reminders: boolean
  }
  learning: {
    daily_goal: number
    preferred_languages: string[]
    review_algorithm: 'standard' | 'aggressive' | 'relaxed'
  }
}

// SQL схема для создания таблиц в Supabase
export const SUPABASE_SCHEMA = `
-- Включение Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица карточек для изучения
CREATE TABLE IF NOT EXISTS study_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 day',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица истории переводов
CREATE TABLE IF NOT EXISTS translation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сессий обучения
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cards_reviewed INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  session_duration INTEGER NOT NULL, -- в секундах
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_study_cards_user_id ON study_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_study_cards_next_review ON study_cards(next_review);
CREATE INDEX IF NOT EXISTS idx_translation_history_user_id ON translation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_cards_updated_at BEFORE UPDATE ON study_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- Политики RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own study cards" ON study_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study cards" ON study_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study cards" ON study_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study cards" ON study_cards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own translation history" ON translation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own translation history" ON translation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own learning sessions" ON learning_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" ON learning_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
`;

// Функции для работы с Supabase (заглушки)
export const supabaseHelpers = {
  // Получение карточек для повторения
  getCardsForReview: async (userId: string) => {
    // В будущем здесь будет реальный запрос к Supabase
    console.log('Getting cards for review for user:', userId)
    return []
  },

  // Обновление результата повторения карточки
  updateCardReview: async (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    // В будущем здесь будет реальный запрос к Supabase
    console.log('Updating card review:', cardId, difficulty)
  },

  // Синхронизация локальных данных с облаком
  syncLocalData: async (userId: string) => {
    // В будущем здесь будет логика синхронизации
    console.log('Syncing local data for user:', userId)
  }
}
`
