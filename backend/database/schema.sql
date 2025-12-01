-- RUN THIS TO SET UP OR RESTART THE DATABASE SCHEMA

DROP DATABASE IF EXISTS art_showcase;
CREATE DATABASE IF NOT EXISTS art_showcase;
USE art_showcase;

-- USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ARTWORK TABLE
CREATE TABLE artwork (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    caption TEXT,
    image_url VARCHAR(255) NOT NULL,
    date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- LIKES TABLE
CREATE TABLE likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artwork_id INT NOT NULL,
    date_liked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, artwork_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id) ON DELETE CASCADE
);

-- COMMENTS TABLE
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artwork_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    date_commented TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id) ON DELETE CASCADE
);

-- SAVED ARTWORKS TABLE
CREATE TABLE saves (
    save_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artwork_id INT NOT NULL,
    date_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_save (user_id, artwork_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id) ON DELETE CASCADE
);

-- FOLLOWERS TABLE
CREATE TABLE follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    date_followed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- HASHTAGS TABLE
CREATE TABLE hashtags (
    hashtag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(50) UNIQUE NOT NULL
);

-- ARTWORK-TAGS RELATIONSHIP
CREATE TABLE artwork_hashtags (
    artwork_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    PRIMARY KEY (artwork_id, hashtag_id),
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(hashtag_id) ON DELETE CASCADE
);

-- LEADERBOARD TABLE
CREATE TABLE leaderboard (
    top_id INT AUTO_INCREMENT PRIMARY KEY,
    artwork_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    total_likes INT NOT NULL,
    UNIQUE KEY unique_top (artwork_id, month, year),
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id) ON DELETE CASCADE
);
