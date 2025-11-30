CREATE DATABASE if NOT EXISTS art_showcase;
USE art_showcase;

-- 1.) USER TABLE 
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ARTWORK TABLE
CREATE TABLE artwork (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(50),
    image_url VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 3. LIKES TABLE
CREATE TABLE likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    artwork_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (artwork_id) REFERENCES artwork(artwork_id)
);