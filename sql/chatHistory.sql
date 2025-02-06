CREATE TABLE if NOT EXISTS ChatHistory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(255) NOT NULL, 
    role ENUM('user', 'ai') NOT NULL, 
    content TEXT NOT NULL, 
    messageHash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);