USE art_showcase;

-- Clear existing data without dropping tables
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE leaderboard;
TRUNCATE TABLE follows;
TRUNCATE TABLE saves;
TRUNCATE TABLE comments;
TRUNCATE TABLE likes;
TRUNCATE TABLE artwork_hashtags;
TRUNCATE TABLE artwork;
TRUNCATE TABLE hashtags;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- USERS TABLE (15 users) - All passwords are 'password' hashed with bcrypt
INSERT INTO users (username, email, password, bio, profile_picture)
VALUES
('GwenVere', 'gwen@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Hopes and dreams', '.https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('thecreature', 'creature@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'hi!', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('cr4n3w1v3sf4n', 'crane@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'I like music and art', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('livinglife_', 'living@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Newbie', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('swirlswirlswirl', 'swirl@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'cute posting', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('gl1de', 'glide@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'sketches', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('JadeHalley', 'jade@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Trying digital art', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('bluebirdhumming', 'bluebird@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Just some guy', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('eichisurvivor', 'eichi@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'just passing time', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('user10', 'user10@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user10', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('user11', 'user11@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user11', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('user12', 'user12@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user12', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('user13', 'user13@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user13', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('user14', 'user14@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user14', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png'),
('user15', 'user15@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2', 'Bio of user15', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/default_afva1u.png');

-- ARTWORK TABLE (10 artworks)
INSERT INTO artwork (user_id, title, caption, image_url)
VALUES
(1, 'Stars', 'A starry night digital painting', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843826/starry_va26rj.png'),
(2, 'Hello', 'Doodle fun', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843822/creature_y3i2ht.jpg'),
(3, 'Easier 1', 'Traditional markers artwork', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/easier1_tcz51a.jpg'),
(3, 'Easier 2', 'Another traditional art piece', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843825/easier2_isa8dc.jpg'),
(4, 'a test', 'Digital hands study', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843822/hands_oclvxs.png'),
(5, 'idk', 'meooow', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843824/meow_ns6lu1.png'),
(6, 'glide', 'i wanna be just like a melody', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843824/glide_rmqyh9.png'),
(7, 'Flowers', 'Tried digital painting', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843827/flowers_wubqac.png'),
(8, 'Blue', 'trying oil pastels', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843824/tsumugi_ywbncn.jpg'),
(9, 'stranger', 'just a stranger i know everything about', 'https://res.cloudinary.com/dlhdhjxdo/image/upload/v1764843823/stranger_mcf335.jpg');

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

-- LIKES TABLE (15 rows)
INSERT INTO likes (user_id, artwork_id)
VALUES
(2,1),(3,1),(4,1),
(1,2),(3,2),(4,2),
(1,3),(2,3),(5,3),
(1,4),(2,4),(5,4),
(1,5),(3,5),(4,6);

-- COMMENTS TABLE (15 rows)
INSERT INTO comments (user_id, artwork_id, comment_text)
VALUES
(2,1,'Amazing!'),(3,1,'So beautiful'),(4,1,'Love it!'),
(1,2,'Cool doodle'),(3,2,'Nice lines'),(4,2,'Fun idea'),
(1,3,'Great markers work'),(2,3,'Looks traditional'),(5,3,'I like this'),
(1,4,'Very detailed'),(2,4,'Awesome'),(5,4,'Cool piece'),
(1,5,'Nice hands study'),(3,5,'Good shading'),(4,6,'So cute!');

-- SAVES TABLE (15 rows)
INSERT INTO saves (user_id, artwork_id)
VALUES
(2,1),(3,1),(4,1),
(1,2),(3,2),(4,2),
(1,3),(2,3),(5,3),
(1,4),(2,4),(5,4),
(1,5),(3,5),(4,6);

-- FOLLOWS TABLE (15 rows)
INSERT INTO follows (follower_id, following_id)
VALUES
(1,2),(1,3),(2,1),
(2,3),(3,1),(3,2),
(4,1),(4,2),(5,3),
(5,4),(6,1),(6,2),
(7,3),(7,4),(8,5);

-- LEADERBOARD TABLE (15 rows)
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
(10,11,2025,0)
