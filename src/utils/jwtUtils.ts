import { ethers } from 'ethers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import nacl from 'tweetnacl';

const JWT_SECRET = process.env.JWT_SECRET;

interface MyJwtPayload extends JwtPayload {
    address: string;
}

/**
 * 生成 JWT
 */
export function generateJWT(payload: object): string {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: '1h' });
}

/**
 * 验证 JWT 并返回负载对象
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
 * 多种签名方案到前缀字节的映射，Sui 目前使用：
 *   ED25519: 0x00, Secp256k1: 0x01, Secp256r1: 0x02
 */
const SIGNATURE_SCHEME_TO_FLAG = {
    ED25519: 0x00,
    Secp256k1: 0x01,
    Secp256r1: 0x02,
};

/** 
 * 基础的 "SerializedSignature" 验证方法：
 *  - 输入: `serializedSignatureB64` (Base64，包含 [1字节scheme, 64字节签名, 32字节公钥] = 97字节)
 *  - 内部解析：若 scheme = 0x00(Ed25519)，则校验签名
 *  - 返回: 是否验证成功
 */
export function verifyMessage(message: Uint8Array, serializedSignatureB64: string): boolean {
    const data = Buffer.from(serializedSignatureB64, 'base64');
    if (data.length !== 1 + 64 + 32) {
        console.error(`Invalid serialized signature length: ${data.length}, expected 97 (ED25519)`);
        return false;
    }
    const scheme = data[0];
    if (scheme !== SIGNATURE_SCHEME_TO_FLAG.ED25519 /*0x00*/) {
        console.error(`Invalid signature scheme, expected ED25519(0x00), got 0x${scheme.toString(16)}`);
        return false;
    }
    const signature = data.slice(1, 65); // 64字节签名
    const publicKey = data.slice(65);   // 32字节公钥
    const res = nacl.sign.detached.verify(message, signature, publicKey);
    console.log(res);
    return true;
}

/**
 * 对外暴露的 Sui 签名验证函数（只要 97 字节的完整 Base64）
 * @param message           - 明文字符串
 * @param serializedSigB64  - 包含 [scheme(1B), signature(64B), pubKey(32B)] 的 Base64
 * @returns 是否验证成功
 */
export async function verifySuiSignature(
    message: string,
    serializedSigB64: string
): Promise<boolean> {
    try {
        // 检查是否 Base64
        if (!isValidBase64(serializedSigB64)) {
            console.error('❌ 签名格式错误 (非 Base64)');
            return false;
        }
        // 将明文转为 Uint8Array
        const messageBytes = new TextEncoder().encode(message);

        return verifyMessage(messageBytes, serializedSigB64);
    } catch (error) {
        console.error('❌ Sui Signature verification failed:', error);
        return false;
    }
}

/**
 * 检查字符串是否为有效的 Base64
 */
function isValidBase64(str: string): boolean {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    } catch (error) {
        return false;
    }
}