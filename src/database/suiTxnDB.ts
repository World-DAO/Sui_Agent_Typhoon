import { query } from "../database/index";

export async function createTransaction(objectId: string, sender: string, receiver: string, amount: number, tokenType: string) {
    await query(
        `INSERT INTO SuiTxn (object_id, sender, receiver, amount, token_type, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [objectId, sender, receiver, amount, tokenType]
    );
}

export async function getTransactionByReply(replyId: string) {
    const object_id = await query(
        `SELECT object_id FROM transaction_reply_mapping WHERE reply_id = ?`,
        [replyId]
    );

}