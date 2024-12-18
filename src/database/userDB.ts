import { query } from './index';

export interface User {
    address: string;
    total_whiskey_points: number;
    created_at: Date;
    updated_at: Date;
}

export async function getUserByAddress(address: string): Promise<User | null> {
    const rows = await query('SELECT * FROM User WHERE address = ? LIMIT 1', [address]);
    return rows.length > 0 ? rows[0] : null;
}

export async function createUser(address: string): Promise<User> {
    await query('INSERT INTO User (address, total_points, created_at, updated_at) VALUES (?,0,NOW(),NOW())', [address]);
    const user = await getUserByAddress(address);
    return user!;
}

export async function updateUserPoints(address: string, newPoints: number): Promise<User | null> {
    await query('UPDATE User SET total_points = ?, updated_at = NOW() WHERE address = ?', [newPoints, address]);
    return await getUserByAddress(address);
}
