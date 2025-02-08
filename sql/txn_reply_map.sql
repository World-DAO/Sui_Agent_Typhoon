CREATE TABLE transaction_reply_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    object_id VARCHAR(255) NOT NULL, 
    reply_id INT NOT NULL, 
    FOREIGN KEY (object_id) REFERENCES SuiTxn (object_id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES StoryReply (id) ON DELETE CASCADE
);