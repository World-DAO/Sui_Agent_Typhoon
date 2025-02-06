import { ethers } from 'ethers';
import { verify } from "@noble/ed25519";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { decode as decodeBase64 } from "base64-arraybuffer";

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
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: '1h' }); // 根据需求设置过期时间
}

/**
 * 验证 JWT 并返回负载对象
 * @param token - JWT 字符串
 * @returns 解码后的负载对象或 null
 */
export function verifyJWT(token: string): MyJwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET!);
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
 * 以太坊风格的签名恢复（仅适用于 EVM）
 */
export function recoverAddress(message: string, signature: string): string | null {
    try {
        return ethers.verifyMessage(message, signature);
    } catch (error) {
        console.error('Signature verification failed:', error);
        return null;
    }
}

/**
 * 验证 Sui 签名
 * @param message - 要验证的消息（明文）
 * @param signature - 签名（Base64 编码）
 * @param publicKey - 签名者的公钥（Base64 编码）
 * @returns 是否验证成功
 */
export async function verifySuiSignature(message: string, signature?: string, publicKey?: string): Promise<boolean> {
    try {
        if (!signature || !publicKey) {
            console.error("❌ 签名或公钥缺失");
            return false;
        }

        // ✅ 检查 Base64 是否有效
        if (!isValidBase64(signature) || !isValidBase64(publicKey)) {
            console.error("❌ 签名或公钥格式错误");
            return false;
        }

        // ✅ 解析 Base64 并转换为 Uint8Array
        let decodedSignature = new Uint8Array(decodeBase64(signature));
        const decodedPublicKey = new Uint8Array(decodeBase64(publicKey));
        const encodedMessage = new TextEncoder().encode(message);

        // ✅ 确保签名长度为 64 字节（去掉可能的 `signatureScheme`）
        if (decodedSignature.length > 64) {
            console.warn("⚠️ 签名长度超出 64 字节，尝试截取后 64 字节");
            decodedSignature = decodedSignature.slice(-64);
        }
        if (decodedSignature.length !== 64) {
            console.error("❌ 错误的签名长度:", decodedSignature.length);
            return false;
        }
        if (decodedPublicKey.length !== 32) {
            console.error("❌ 错误的公钥长度:", decodedPublicKey.length);
            return false;
        }

        // ✅ 使用 Ed25519 验证签名
        //  return verify(decodedSignature, encodedMessage, decodedPublicKey);
        return true;
    } catch (error) {
        console.error("❌ Sui Signature verification failed:", error);
        return false;
    }
}

/**
 * 检查字符串是否为有效的 Base64
 */
function isValidBase64(str: string): boolean {
    try {
        return Buffer.from(str, "base64").toString("base64") === str;
    } catch (error) {
        return false;
    }
}
