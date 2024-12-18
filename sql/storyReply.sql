CREATE TABLE StoryReply (
    id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    parent_reply_id INT,
    author_address VARCHAR(50) NOT NULL,
    reply_content LONGTEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES Story (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES StoryReply (id) ON DELETE CASCADE,
    INDEX (story_id),
    INDEX (parent_reply_id),
    INDEX (author_address),
    INDEX (created_at)
);