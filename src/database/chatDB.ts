import internal from 'stream';
import { query } from './index';

/**
 * 存储聊天记录
 * @param userId - 用户 ID
 * @param role - 发送者（"user" 或 "ai"）
 * @param content - 聊天内容
 */
export async function saveChatMessage(userId: string, role: "user" | "ai", content: string) {
    try {
        const messageHash = generateMessageHash(userId, content);
        await query(
            "INSERT INTO chatHistory (user_id, role, content, message_hash) VALUES (?, ?, ?, ?)",
            [userId, role, content, messageHash]
        );
    } catch (error) {
        console.error("❌ 存储聊天记录失败:", error);
        throw error;
    }
}

/**
 * 读取用户的聊天记录
 * @param userId - 用户 ID
 * @param prevCnt - 记录数量
 * @returns 聊天记录数组
 */
export async function getChatHistory(userId: string, prevCnt: number) {
    try {
        const results = await query(
            `SELECT user_id, role, content, created_at FROM chatHistory WHERE user_id = ? ORDER BY created_at DESC LIMIT ${prevCnt}`,
            [userId]
        );
        return results.reverse();
    } catch (error) {
        console.error("❌ 获取聊天记录失败:", error);
        throw error;
    }
}

/**
 * 生成消息哈希值
 * @param userId - 用户 ID
 * @param content - 聊天内容
 * @returns SHA256 哈希
 */
import { createHash } from "crypto";
function generateMessageHash(userId: string, content: string): string {
    return createHash("sha256").update(userId + content).digest("hex");
}

