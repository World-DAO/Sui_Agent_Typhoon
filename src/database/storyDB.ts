import { query } from './index';

export interface Story {
    id: number;
    author_address: string;
    story_content: string;
    created_at: Date;
}

export interface Reply {
    id: number;
    story_id: number;
    parent_reply_id: number;
    author_address: string;
    reply_content: string;
    created_at: Date;
}

export async function publishStory(authorAddress: string, content: string): Promise<Story> {
    await query(
        'INSERT INTO Story (author_address, story_content, whiskey_points, created_at) VALUES (?, ?, 0, NOW())',
        [authorAddress, content]
    );
    const rows = await query(
        'SELECT * FROM Story WHERE author_address = ? ORDER BY id DESC LIMIT 1',
        [authorAddress]
    );
    return rows[0];
}

export async function deleteStory(storyId: string): Promise<boolean> {
    try {
        await query('DELETE FROM Story WHERE id = ?', [storyId]);
        return true;
    } catch (error) {
        console.error('Error deleting story:', error);
        return false;
    }

}

export async function getRandomStory(): Promise<Story> {
    const rows = await query(
        `SELECT id, author_address, story_content, whiskey_points, created_at FROM Story ORDER BY RAND() LIMIT 1`,
    );
    return rows[0];
}

export async function getStoryByAuthor(authorAddress: string): Promise<Story[]> {
    const rows = await query(
        'SELECT * FROM Story WHERE author_address = ? ORDER BY created_at DESC',
        [authorAddress]
    );
    return rows;
}

export async function getStoryById(id: string): Promise<Story> {
    const rows = await query('SELECT * FROM Story WHERE id = ?', [id]);
    return rows[0];
}

export async function replyStory(address: string, id: string, content: string) {
    await query(`INSERT INTO StoryReply (story_id, author_address, reply_content) VALUES (?, ?, ?)`,
        [id, address, content]
    );
    const rows = await query(
        'SELECT * FROM StoryReply WHERE author_address = ? ORDER BY id DESC LIMIT 1',
        [address]
    );
    return rows[0];
}

export async function reply(address: string, id: string, content: string, to_address: string) {
    await query(`INSERT INTO StoryReply (story_id, author_address, reply_content, to_address) VALUES (?, ?, ?, ?)`,
        [id, address, content, to_address]
    );
    const rows = await query(
        'SELECT * FROM StoryReply WHERE author_address = ? ORDER BY id DESC LIMIT 1',
        [address]
    );
    return rows[0];
}

export async function getReplyByToAddress(address: string): Promise<Reply[]> {
    const rows = await query('SELECT * FROM StoryReply WHERE to_address = ? ORDER BY created_at DESC', [address]);
    return rows;
}

export async function getNewReplyByToAddress(address: string): Promise<Reply[]> {
    const rows = await query('SELECT * FROM StoryReply WHERE to_address = ? and unread = 1 ORDER BY created_at DESC', [address]);
    return rows;
}

export async function getReplyByStoryId(story_id: number): Promise<Reply[]> {
    const rows = await query(`SELECT * FROM StoryReply WHERE story_id = ? ORDER BY created_at DESC`, [story_id]);
    return rows;
}

export async function markReplyRead(reply_id: string) {
    await query(`UPDATE StoryReply SET unread = 0 WHERE id = ?`, [reply_id]);
}

export async function markReplyUnread(reply_id: string) {
    await query(`UPDATE StoryReply SET unread = 1 WHERE id = ?`, [reply_id]);
}

export async function addWhiskeyPoints(storyId: string) {
    await query('UPDATE Story SET whiskey_points = whiskey_points + 1 WHERE id = ?', [storyId]);
}