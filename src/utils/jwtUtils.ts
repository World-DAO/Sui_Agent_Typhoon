// src/utils/jwtUtils.ts
import { ethers } from 'ethers';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// 定义 JWT 负载接口
interface MyJwtPayload extends JwtPayload {
    address: string;
}

/**
 * 生成 JWT
 * @param payload - JWT 负载
 * @returns JWT 字符串
 */
export function generateJWT(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // 根据需求设置过期时间
}

/**
 * 验证 JWT 并返回负载对象
 * @param token - JWT 字符串
 * @returns 解码后的负载对象或 null
 */
export function verifyJWT(token: string): MyJwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'object' && decoded !== null && 'address' in decoded) {
            return decoded as MyJwtPayload;
        }
        return null;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * 验证签名并返回恢复的地址
 * @param message - 要验证的消息
 * @param signature - 签名
 * @returns 恢复的地址或 null
 */
export function recoverAddress(message: string, signature: string): string | null {
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress;
    } catch (error) {
        console.error('Signature verification failed:', error);
        return null;
    }
}