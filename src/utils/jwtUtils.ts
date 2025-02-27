import jwt, { JwtPayload } from 'jsonwebtoken';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { SerializedSignature } from '@mysten/sui.js/cryptography';

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
 * 验证 JWT 并返回 payload
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
 * 验证 Sui 签名
 */
export async function verifySuiSignature(address: string, challenge: string, signature: string): Promise<boolean> {
    try {
        console.log("\n=== Input Values ===");
        console.log("Address:", address);
        console.log("Challenge:", challenge);
        console.log("Signature:", signature);

        const messageBytes = new TextEncoder().encode(challenge);

        const publicKey = await verifyPersonalMessageSignature(
            messageBytes,
            signature as SerializedSignature,
            { address }
        );

        console.log("\n=== Verification Result ===");
        console.log("Public Key:", publicKey);
        return true;
    } catch (error) {
        console.error("\n=== Verification Error ===");
        console.error("Error:", error);
        return false;
    }
}
