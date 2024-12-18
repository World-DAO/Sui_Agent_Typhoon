import { createPool } from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = createPool({
    uri: databaseUrl,
    connectionLimit: 10,
});

export async function query(sql: string, params?: any[]): Promise<any[]> {
    const [rows] = await pool.execute(sql, params);
    return rows as any[];
}



