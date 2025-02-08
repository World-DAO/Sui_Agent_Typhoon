import { createTransaction, getTransactionByReply, updateTransactionStatus, claimTransaction, createUserPayment, createReplyInSession, claimSessionRewards, createUserSession } from "../database/suiTxnDB";

export class TxnService {
    /**
     * 创建一笔新的交易
     * @param objectId 交易的唯一对象 ID
     * @param sender 发送者地址
     * @param receiver 接收者地址
     * @param amount 转账金额
     * @param tokenType 代币类型（SUI 或其他）
     */
    static async createNewTransaction(objectId: string, replyId: string, sender: string, receiver: string, amount: number, tokenType: string) {
        try {
            await createTransaction(objectId, replyId, sender, receiver, amount, tokenType);
            return { success: true, message: "Transaction created successfully" };
        } catch (error) {
            console.error("❌ 创建交易失败:", error);
            return { success: false, message: "Failed to create transaction" };
        }
    }

    /**
     * 根据 replyId 获取绑定的交易信息
     * @param replyId 绑定的回复 ID
     */
    static async fetchTransactionByReply(replyId: string) {
        try {
            const transaction = await getTransactionByReply(replyId);
            if (!transaction) {
                return { success: false, message: "No transaction found for this reply" };
            }
            return { success: true, transaction };
        } catch (error) {
            console.error("❌ 获取交易失败:", error);
            return { success: false, message: "Failed to fetch transaction" };
        }
    }

    /**
     * 更新交易状态
     * @param objectId 交易对象 ID
     * @param status 新的交易状态 (e.g., 'pending', 'claimed', 'failed')
     */
    static async modifyTransactionStatus(objectId: string, status: string) {
        try {
            await updateTransactionStatus(objectId, status);
            return { success: true, message: "Transaction status updated successfully" };
        } catch (error) {
            console.error("❌ 更新交易状态失败:", error);
            return { success: false, message: "Failed to update transaction status" };
        }
    }

    /**
     * 用户领取交易
     * @param receiver 领取交易的用户地址
     * @param objectId 交易对象 ID
     */
    static async claimUserTransaction(receiver: string, objectId: string) {
        try {
            const result = await claimTransaction(receiver, objectId);
            return result;
        } catch (error) {
            console.error("❌ 领取交易失败:", error);
            return { success: false, message: "Failed to claim transaction" };
        }
    }

    /**
     * 用户支付（创建交易对象）
     * @param objectId 交易对象ID
     * @param sender 发送人
     * @param receiver 接收人
     * @param amount 交易金额
     * @param tokenType 代币类型
     */
    static async initiateUserPayment(objectId: string, sender: string, receiver: string, amount: number, tokenType: string) {
        return await createUserPayment(objectId, sender, receiver, amount, tokenType);
    }

    /**
         * 用户支付并创建会话
         * @param txnObjectId 交易对象ID
         * @param sessionId 会话ID
         * @param userAddress 用户地址
         * @param receiverAddress 目标地址
         * @param amount 交易金额
         * @param tokenType 代币类型
         */
    static async startUserSession(txnObjectId: string, sessionId: string, userAddress: string, receiverAddress: string, amount: number, tokenType: string) {
        return await createUserSession(txnObjectId, sessionId, userAddress, receiverAddress, amount, tokenType);
    }

    /**
     * AI 在会话中回复 & 发送 NFT
     * @param nftObjectId NFT 对象 ID
     * @param userAddress 用户地址
     * @param content AI 生成的内容
     */
    static async aiReplyWithNFT(nftObjectId: string, userAddress: string) {
        return await createReplyInSession(nftObjectId, userAddress);
    }

    /**
     * 用户领取 AI 会话奖励（领取 NFT）
     * @param userAddress 用户地址
     */
    static async claimRewards(userAddress: string) {
        return await claimSessionRewards(userAddress);
    }

}