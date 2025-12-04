CREATE DATABASE IF NOT EXISTS art_showcase;
USE art_showcase;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they already exist
DROP TABLE IF EXISTS leaderboard;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS saves;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS artwork_hashtags;
DROP TABLE IF EXISTS artwork;
DROP TABLE IF EXISTS hashtags;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Recreate tables

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bio VARCHAR(255),
    profile_picture VARCHAR(255)
);

CREATE TABLE artwork (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100),
    caption VARCHAR(255),
    image_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE hashtags (
    hashtag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(50) UNIQUE
);

CREATE TABLE artwork_hashtags (
    artwork_id INT,
    hashtag_id INT,
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id),
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(hashtag_id)
);

CREATE TABLE likes (
    user_id INT,
    artwork_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id)
);

CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    artwork_id INT,
    comment_text VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id)
);

CREATE TABLE saves (
    user_id INT,
    artwork_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id)
);

CREATE TABLE follows (
    follower_id INT,
    following_id INT,
    FOREIGN KEY (follower_id) REFERENCES users(user_id),
    FOREIGN KEY (following_id) REFERENCES users(user_id)
);

CREATE TABLE leaderboard (
    leaderboard_id INT AUTO_INCREMENT PRIMARY KEY,
    artwork_id INT,
    month INT,
    year INT,
    total_likes INT,
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id)
);