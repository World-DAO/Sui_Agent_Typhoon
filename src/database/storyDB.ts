import { query } from './index';

export interface Story {
    id: number;
    author_address: string;
    story_content: string;
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

export async function getRandomStory(): Promise<Story[]> {
    const rows = await query(
        `SELECT id, author_address, story_content, whiskey_points, created_at FROM Story ORDER BY RAND() LIMIT 1`,
    );
    return rows;
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

export async function addWhiskeyPoints(id: string) {
    await query('UPDATE Story SET whiskey_points = whiskey_points + 1 WHERE id = ?', [id]);
}