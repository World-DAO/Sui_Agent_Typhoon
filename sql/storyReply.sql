CREATE TABLE StoryReply (
    id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    author_address VARCHAR(50) NOT NULL,
    reply_content LONGTEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    to_address VARCHAR(255) NOT NULL,
    unread INT DEFAULT 1,
    FOREIGN KEY (story_id) REFERENCES Story (id) ON DELETE CASCADE,
    INDEX (story_id),
    INDEX (to_address),
    INDEX (author_address),
    INDEX (created_at)
);