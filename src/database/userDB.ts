import { query } from './index';

export interface User {
    address: string;
    total_whiskey_points: number;
    likedStories: JSON;
    created_at: Date;
    updated_at: Date;
}

export async function getUserByAddress(address: string) {
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

    let rawLikedStories = result[0].likedStories;
    console.log("rawLikedStories:", rawLikedStories, "Type:", typeof rawLikedStories);

    // 默认空数组
    let likedStories: string[] = [];

    // 如果 rawLikedStories 是 "{}", 表示空
    if (typeof rawLikedStories === 'object' &&
        !Array.isArray(rawLikedStories) &&
        Object.keys(rawLikedStories).length === 0) {
        likedStories = [];
    } else {
        likedStories = rawLikedStories;
    }

    console.log("Before adding:", likedStories, "Type:", typeof likedStories);

    // 如果已经包含 storyId，就视作重复
    if (likedStories.includes(storyId)) {
        console.warn(`Story ID "${storyId}" already exists in likedStories.`);
        return null; // 或者你想返回什么都可以
    }

    // 不包含则添加
    likedStories.push(storyId);

    console.log("Updated likedStories:", likedStories);

    // 更新数据库：序列化成 JSON 数组再写回去
    await query(
        'UPDATE User SET likedStories = ? WHERE address = ?',
        [JSON.stringify(likedStories), address]
    );

    // 返回更新后的用户信息
    const updatedUser = await query('SELECT * FROM User WHERE address = ?', [address]);
    return updatedUser.length > 0 ? updatedUser[0] as User : null;
}

export async function getIntimacy(address: string): Promise<number> {
    const rows = await query('SELECT intimacy FROM User WHERE address = ?', [address]);
    const { intimacy } = rows[0];
    if (typeof intimacy !== 'number') {
        throw new Error(`Invalid total_points value for user ${address}.`);
    }
    return intimacy;
}

export async function updateIntimacy(address: string, newIntimacy: number): Promise<User | null> {
    await query('UPDATE User SET intimacy = ?, updated_at = NOW() WHERE address = ?', [newIntimacy, address]);
    return await getUserByAddress(address);
}