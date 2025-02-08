CREATE TABLE Session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_address VARCHAR(255) NOT NULL,
    txn_object_id VARCHAR(255) NOT NULL,
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (txn_object_id) REFERENCES SuiTxn (object_id) ON DELETE CASCADE
);