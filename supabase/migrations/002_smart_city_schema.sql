-- Smart City Explorer Database Schema

-- Drop old music tables
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;

-- Favorites (places)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  category TEXT,
  address TEXT,
  rating DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  destinations JSONB NOT NULL,
  total_distance DOUBLE PRECISION,
  total_duration INTEGER,
  transport_mode TEXT DEFAULT 'walking',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  default_transport TEXT DEFAULT 'walking',
  preferred_categories TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Routes policies
CREATE POLICY "Users can view own routes" ON routes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routes" ON routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes" ON routes
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
