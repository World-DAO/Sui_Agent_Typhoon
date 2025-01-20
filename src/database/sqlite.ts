import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const databaseFile = process.env.DATABASE_FILE || 'database.db';

let _db: any;  // 用于缓存单例的 db

async function getDb() {
    if (!_db) {
        _db = await open({
            filename: databaseFile,
            driver: sqlite3.Database,
        });
    }
    return _db;
}

/**
 * 执行 SQL 查询并返回结果数组
 * @param sql - SQL 语句
 * @param params - 可选的参数数组
 */
export async function query(sql: string, params?: any[]): Promise<any[]> {
    const db = await getDb();
    const rows = await db.all(sql, params);
    return rows;
}