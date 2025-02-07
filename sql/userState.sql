CREATE TABLE UserState (
    address VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    published_num INTEGER NOT NULL DEFAULT 0,
    received_num INTEGER NOT NULL DEFAULT 0,
    sent_whiskey_num INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (address, date),
    FOREIGN KEY (address) REFERENCES User (address) ON DELETE CASCADE,
    INDEX (date)
);