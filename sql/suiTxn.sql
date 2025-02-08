CREATE TABLE SuiTxn(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id VARCHAR(255) NOT NULL UNIQUE,
    sender VARCHAR(255),
    receiver VARCHAR(255),
    amount DECIMAL(18, 6),
    token_type ENUM('SUI', 'CUSTOM') NOT NULL,
    status ENUM( 'pending', 'claimed', 'failed' ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    claimed_at TIMESTAMP NULL DEFAULT NULL
);