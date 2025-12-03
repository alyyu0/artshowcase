USE art_showcase;

-- USERS TABLE (15 users)
INSERT INTO users (username, email, password, bio, profile_picture)
VALUES
('GwenVere', 'gwen@example.com', 'hashedpass1', 'Hopes and dreams', './images/profilepictures/default.png'),
('thecreature', 'creature@example.com', 'hashedpass2', 'hi!', './images/profilepictures/default.png'),
('cr4n3w1v3sf4n', 'crane@example.com', 'hashedpass3', 'I like music and art', './images/profilepictures/default.png'),
('livinglife_', 'living@example.com', 'hashedpass4', 'Newbie', './images/profilepictures/default.png'),
('swirlswirlswirl', 'swirl@example.com', 'hashedpass5', 'cute posting', './images/profilepictures/default.png'),
('gl1de', 'glide@example.com', 'hashedpass6', 'sketches', './images/profilepictures/default.png'),
('JadeHalley', 'jade@example.com', 'hashedpass7', 'Trying digital art', './images/profilepictures/default.png'),
('bluebirdhumming', 'bluebird@example.com', 'hashedpass8', 'Just some guy', './images/profilepictures/default.png'),
('eichisurvivor', 'eichi@example.com', 'hashedpass9', 'just passing time', './images/profilepictures/default.png'),
('user10', 'user10@example.com', 'hashedpass10', 'Bio of user10', './images/profilepictures/default.png'),
('user11', 'user11@example.com', 'hashedpass11', 'Bio of user11', './images/profilepictures/default.png'),
('user12', 'user12@example.com', 'hashedpass12', 'Bio of user12', './images/profilepictures/default.png'),
('user13', 'user13@example.com', 'hashedpass13', 'Bio of user13', './images/profilepictures/default.png'),
('user14', 'user14@example.com', 'hashedpass14', 'Bio of user14', './images/profilepictures/default.png'),
('user15', 'user15@example.com', 'hashedpass15', 'Bio of user15', './images/profilepictures/default.png');

-- ARTWORK TABLE (10 artworks)
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
