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

-- INSERT SAMPLE DATA BELOW 👇 (Your same sample data)
-- USERS TABLE
INSERT INTO users (username, email, password, bio, profile_picture)
VALUES
('GwenVere', 'gwen@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Hopes and dreams', './images/profilepictures/default.png'),
('thecreature', 'creature@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'hi!', './images/profilepictures/default.png'),
('cr4n3w1v3sf4n', 'crane@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'I like music and art', './images/profilepictures/default.png'),
('livinglife_', 'living@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Newbie', './images/profilepictures/default.png'),
('swirlswirlswirl', 'swirl@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'cute posting', './images/profilepictures/default.png'),
('gl1de', 'glide@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'sketches', './images/profilepictures/default.png'),
('JadeHalley', 'jade@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Trying digital art', './images/profilepictures/default.png'),
('bluebirdhumming', 'bluebird@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Just some guy', './images/profilepictures/default.png'),
('eichisurvivor', 'eichi@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'just passing time', './images/profilepictures/default.png'),
('user10', 'user10@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user10', './images/profilepictures/default.png'),
('user11', 'user11@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user11', './images/profilepictures/default.png'),
('user12', 'user12@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user12', './images/profilepictures/default.png'),
('user13', 'user13@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user13', './images/profilepictures/default.png'),
('user14', 'user14@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user14', './images/profilepictures/default.png'),
('user15', 'user15@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user15', './images/profilepictures/default.png');

-- ARTWORK TABLE
INSERT INTO artwork (user_id, title, caption, image_url)
VALUES
(1, 'Stars', 'A starry night digital painting', './images/artworks/starry.png'),
(2, 'Hello', 'Doodle fun', './images/artworks/creature.jpg'),
(3, 'Easier 1', 'Traditional markers artwork', './images/artworks/easier1.jpg'),
(3, 'Easier 2', 'Another traditional art piece', './images/artworks/easier2.jpg'),
(4, 'a test', 'Digital hands study', './images/artworks/hands.png'),
(5, 'idk', 'Cute digital cat', './images/artworks/meow.png'),
(6, 'glide', 'i wanna be just like a melody', './images/artworks/glide.png'),
(7, 'Flowers', 'Tried digital painting', './images/artworks/flowers.png'),
(8, 'Blue', 'trying oil pastels', './images/artworks/tsumugi.png'),
(9, 'stranger', 'just a stranger i know everything about', './images/artworks/stranger.png');

-- HASHTAGS TABLE
INSERT INTO hashtags (tag)
VALUES
('digitalart'), ('stars'), ('doodle'), ('traditionalart'),
('markers'), ('hands'), ('cute'), ('sketch'),
('painting'), ('oilpastel'), ('random');

-- ARTWORK_HASHTAGS TABLE
INSERT INTO artwork_hashtags (artwork_id, hashtag_id)
VALUES
(1,1),(1,2),
(2,3),
(3,4),(3,5),
(4,4),(4,5),
(5,1),(5,6),
(6,1),(6,7),
(7,1),(7,8),
(8,1),(8,9),
(9,4),(9,10),
(10,4),(10,3),(10,11);

-- LIKES TABLE
INSERT INTO likes (user_id, artwork_id)
VALUES
(2,1),(3,1),(4,1),
(1,2),(3,2),(4,2),
(1,3),(2,3),(5,3),
(1,4),(2,4),(5,4),
(1,5),(3,5),(4,6);

-- COMMENTS TABLE
INSERT INTO comments (user_id, artwork_id, comment_text)
VALUES
(2,1,'Amazing!'),(3,1,'So beautiful'),(4,1,'Love it!'),
(1,2,'Cool doodle'),(3,2,'Nice lines'),(4,2,'Fun idea'),
(1,3,'Great markers work'),(2,3,'Looks traditional'),(5,3,'I like this'),
(1,4,'Very detailed'),(2,4,'Awesome'),(5,4,'Cool piece'),
(1,5,'Nice hands study'),(3,5,'Good shading'),(4,6,'So cute!');

-- SAVES TABLE
INSERT INTO saves (user_id, artwork_id)
VALUES
(2,1),(3,1),(4,1),
(1,2),(3,2),(4,2),
(1,3),(2,3),(5,3),
(1,4),(2,4),(5,4),
(1,5),(3,5),(4,6);

-- FOLLOWS TABLE
INSERT INTO follows (follower_id, following_id)
VALUES
(1,2),(1,3),(2,1),
(2,3),(3,1),(3,2),
(4,1),(4,2),(5,3),
(5,4),(6,1),(6,2),
(7,3),(7,4),(8,5);

-- LEADERBOARD TABLE
INSERT INTO leaderboard (artwork_id, month, year, total_likes)
VALUES
(1,11,2025,3),
(2,11,2025,3),
(3,11,2025,3),
(4,11,2025,3),
(5,11,2025,3),
(6,11,2025,1),
(7,11,2025,0),
(8,11,2025,0),
(9,11,2025,0),
(10,11,2025,0);
