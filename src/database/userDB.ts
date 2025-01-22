import { query } from './index';

export interface User {
    address: string;
    total_whiskey_points: number;
    likedStories: JSON;
    created_at: Date;
    updated_at: Date;
}

export async function getUserByAddress(address: string): Promise<User | null> {
    const rows = await query('SELECT * FROM User WHERE address = ? LIMIT 1', [address]);
    return rows.length > 0 ? rows[0] : null;
}

export async function createUser(address: string): Promise<User> {
    const j = {};
    await query('INSERT INTO User (address, total_points, likedStories, created_at, updated_at) VALUES (?,0,?,NOW(),NOW())', [address, j]);
    const user = await getUserByAddress(address);
    return user!;
}

export async function getUserPoints(address: string): Promise<number> {
    const rows = await query('SELECT total_points FROM User WHERE address = ?', [address]);
    const { total_points } = rows[0];
    if (typeof total_points !== 'number') {
        throw new Error(`Invalid total_points value for user ${address}.`);
    }
    return total_points;
}

export async function updateUserPoints(address: string, newPoints: number): Promise<User | null> {
    await query('UPDATE User SET total_points = ?, updated_at = NOW() WHERE address = ?', [newPoints, address]);
    return await getUserByAddress(address);
}

export async function markLikedStory(address: string, storyId: string): Promise<User | null> {
    const result = await query('SELECT likedStories FROM User WHERE address = ?', [address]);
    if (result.length === 0) {
        throw new Error("User not found.");
    }
    const rawLikedStories = result[0].likedStories;
    const likedStories = typeof rawLikedStories === "string" ? JSON.parse(rawLikedStories) : rawLikedStories || [];

    // 检查故事是否已经被收藏
    if (!likedStories.includes(storyId)) {
        likedStories.push(storyId);
    } else {
        throw new Error("Story already liked.");
    }
    await query('UPDATE User SET likedStories= ? WHERE address = ?', [JSON.stringify(likedStories), address]);
    const updatedUser = await query('SELECT * FROM User WHERE address = ?', [address]);
    return updatedUser.length > 0 ? updatedUser[0] as User : null;
}