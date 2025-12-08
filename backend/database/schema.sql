-- Supabase/Postgres schema (UUID primary keys where appropriate)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS table (UUID primary key suitable for mapping to auth.users)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255),
  bio VARCHAR(255),
  profile_picture VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ARTWORK table
CREATE TABLE IF NOT EXISTS artwork (
  artwork_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  caption VARCHAR(500),
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HASHTAGS
CREATE TABLE IF NOT EXISTS hashtags (
  hashtag_id SERIAL PRIMARY KEY,
  tag VARCHAR(50) UNIQUE NOT NULL
);

-- ARTWORK_HASHTAGS
CREATE TABLE IF NOT EXISTS artwork_hashtags (
  artwork_id UUID REFERENCES artwork(artwork_id) ON DELETE CASCADE,
  hashtag_id INTEGER REFERENCES hashtags(hashtag_id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, hashtag_id)
);

-- LIKES
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artwork(artwork_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artwork(artwork_id) ON DELETE CASCADE,
  comment_text VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SAVES
CREATE TABLE IF NOT EXISTS saves (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artwork(artwork_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- FOLLOWS
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard (
  leaderboard_id SERIAL PRIMARY KEY,
  artwork_id UUID REFERENCES artwork(artwork_id) ON DELETE CASCADE,
  month INTEGER,
  year INTEGER,
  total_likes INTEGER DEFAULT 0
);