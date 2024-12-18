import { query } from './index';

export interface UserState {
    address: string;
    date: Date;
    published_num: number;
    received_num: number;
    sent_whiskey_num: number;
}

export async function getUserState(address: string): Promise<UserState | null> {
    const rows = await query(
        'SELECT address, date, published_num, received_num, sent_whiskey_num FROM UserState WHERE address = ? AND date = CURDATE() LIMIT 1',
        [address]
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function setUserState(address: string, published_num: number, received_num: number, sent_whiskey_num: number): Promise<void> {
    await query(
        `INSERT INTO UserState (address, date, published_num, received_num, sent_whiskey_num) 
        VALUES (?, CURDATE(), ?, ?, ?)  
        ON DUPLICATE KEY UPDATE 
            published_num = VALUES(published_num), 
            received_stories = VALUES(received_num),
            sent_whiskey = VALUES(sent_whiskey_num)`,
        [address, published_num, received_num, sent_whiskey_num]
    );
}

export async function initializeUserState(address: string): Promise<void> {
    await query(
        `INSERT IGNORE INTO UserState (address, date, published_num, received_num, sent_whiskey_num) VALUES (?, CURDATE(), 0, 0, 0)`,
        [address]
    );
}

export async function addUserPublishedStory(address: string): Promise<void> {
    await query(
        `UPDATE UserState SET published_num = published_num + 1 WHERE address = ? AND date = CURDATE()`,
        [address]
    );
}

export async function addUserReceivedStory(address: string): Promise<void> {
    await query(
        `UPDATE UserState SET received_num = received_num + 1 WHERE address = ? AND date = CURDATE()`,
        [address]
    );
}

export async function addUserSentWhiskey(address: string): Promise<void> {
    await query(
        `UPDATE UserState SET sent_whiskey_num = sent_whiskey_num + 1 WHERE address = ? AND date = CURDATE()`,
        [address]
    );
}
