-- Active: 1734506594209@@127.0.0.1@3306@Bar
CREATE TABLE Story (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    author_address VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    story_content LONGTEXT NOT NULL,
    whiskey_points INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (author_address),
    INDEX (created_at)
);