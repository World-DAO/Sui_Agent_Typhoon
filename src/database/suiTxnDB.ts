import { query } from "../database/index";

export async function createTransaction(objectId: string, replyId: string, sender: string, receiver: string, amount: number, tokenType: string) {
    await query(
        `INSERT INTO SuiTxn (object_id, sender, receiver, amount, token_type, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [objectId, sender, receiver, amount, tokenType]
    );
    await query(
        `INSERT INTO transaction_reply_mapping (object_id, reply_id) VALUES (?, ?)`,
        [objectId, replyId]
    );
}

export async function getTransactionByReply(replyId: string) {
    const result = await query(
        `SELECT object_id FROM transaction_reply_mapping WHERE reply_id = ?`,
        [replyId]
    );
    if (result.length === 0) {
        throw new Error("No transaction found for this reply.");
    }
    const transaction = await query(
        `SELECT * FROM SuiTxn WHERE object_id = ?`,
        [result[0].object_id]
    );
    return transaction.length > 0 ? transaction[0] : null;
}

export async function updateTransactionStatus(objectId: string, status: string) {
    await query(
        `UPDATE SuiTxn SET status = ? WHERE object_id = ?`,
        [status, objectId]
    );
}

export async function claimTransaction(receiver: string, object_id: string) {
    const transaction = await query(
        `SELECT * FROM SuiTxn WHERE object_id = ? AND receiver = ? AND status = 'pending'`,
        [object_id, receiver]
    );

    if (transaction.length === 0) {
        throw new Error("No pending transaction found or unauthorized access.");
    }

    await updateTransactionStatus(object_id, "claimed");

    return { success: true, message: "Transaction claimed successfully." };
}

/**
 * 用户支付（创建交易对象）
 */
export async function createUserPayment(objectId: string, sender: string, receiver: string, amount: number, tokenType: string) {
    await query(
        `INSERT INTO SuiTxn (object_id, sender, receiver, amount, token_type, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [objectId, sender, receiver, amount, tokenType]
    );
    return objectId;
}

/**
 * 用户支付，创建会话对象
 */
export async function createUserSession(txnObjectId: string, sessionId: string, userAddress: string, receiverAddress: string, amount: number, tokenType: string) {
    // ✅ 存入交易表
    await query(
        `INSERT INTO SuiTxn (object_id, sender, receiver, amount, token_type, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [txnObjectId, userAddress, receiverAddress, amount, tokenType]
    );

    // ✅ 存入会话表
    await query(
        `INSERT INTO Session (session_id, user_address, txn_object_id, status) VALUES (?, ?, ?, 'active')`,
        [sessionId, userAddress, txnObjectId]
    );

    return { sessionId, txnObjectId };
}

/**
 * AI 回复用户，并在会话中创建交易 & NFT
 */
export async function createReplyInSession(nftObjectId: string, userAddress: string, content: string) {
    // ✅ 确保会话存在 & 处于 `active` 状态
    const session = await query(`SELECT * FROM Session WHERE user_address = ? AND status = 'active'`, [userAddress]);
    if (session.length === 0) {
        throw new Error("Invalid or closed session.");
    }

    const sessionId = session[0].session_id;

    // ✅ 绑定 NFT 到会话
    await query(`INSERT INTO NFT_Mint (nft_object_id, owner, session_id) VALUES (?, ?, ?)`, [nftObjectId, userAddress, sessionId]);
    return { success: true, nftObjectId };
}

/**
 * 关闭会话 & 用户领取代币 & NFT
 */
export async function claimSessionRewards(userAddress: string) {
    // ✅ 确保会话存在 & 处于 `active` 状态
    const session = await query(`SELECT * FROM Session WHERE user_address = ? AND status = 'active'`, [userAddress]);
    if (session.length === 0) {
        throw new Error("Invalid or already closed session.");
    }
    const sessionId = session[0].session_id;

    // ✅ 查询 NFT
    const nft = await query(`SELECT nft_object_id FROM NFT_Mint WHERE session_id = ?`, [sessionId]);

    // ✅ 关闭会话
    await query(`UPDATE Session SET status = 'closed' WHERE session_id = ?`, [sessionId]);

    // ✅ 返回领取的 NFT
    return { success: true, nft };
}