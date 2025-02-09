import express from "express";
import { aiService } from "../services/aiService";
import { StoryService } from "../services/storyServices";
import { UserService } from "../services/userService";
import { TxnService } from "../services/txnService";
import { ReplyService } from "../services/replyService";

const router = express.Router();

/**
 * 获取用户和 AI 的聊天记录
 */
router.get("/chat_history", async (req, res) => {
    const { user_id, prev_cnt } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "userId is required" });
    }
    const prevCnt = Number(prev_cnt);
    try {
        const history = await aiService.getChatHistory(user_id as string, prevCnt);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

/**
 * 写入用户和 AI 的聊天记录
 */
router.post("/store_chat_history", async (req, res) => {
    const { user_id, role, content } = req.body;
    // 参数校验
    if (!user_id || !role || !content) {
        return res.status(400).json({ error: "user_id, role, and content are required" });
    }

    if (!["user", "ai"].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be 'user' or 'ai'." });
    }

    try {
        const result = await aiService.saveChatHistory(user_id, role, content);
        res.status(201).json(result);
    } catch (error) {
        console.error("❌ Failed to save chat history:", error);
        res.status(500).json({ error: "Failed to save chat history" });
    }
});

router.get("/get_intimacy", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "user_id are required" });
    }
    try {
        const intimacy = await UserService.getIntimacy(user_id as string);
        res.json({ success: true, intimacy });
    } catch (error) {
        console.error("❌ Failed to fetch intimacy:", error);
        res.status(500).json({ error: "Failed to fetch intimacy" });
    }
});

router.put("/update_intimacy", async (req, res) => {
    const { user_id, new_intimacy } = req.body;
    if (!user_id || !new_intimacy) {
        return res.status(400).json({ error: "user_id and new_intimacy are required" });
    }
    try {
        await UserService.updateIntimacy(user_id as string, Number(new_intimacy));
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Failed to update intimacy:", error);
        res.status(500).json({ error: "Failed to update intimacy" });
    }
})

router.get("/sent_bottle_msg", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "userId is required" });
    }
    try {
        const bottles = await aiService.getStoryByAuthor(user_id as string);
        res.json(bottles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch sent bottle messages" });
    }
});

router.get("/recv_bottle_msg", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "userId is required" });
    }
    try {
        const bottles = await aiService.getLikedStories(user_id as string);
        res.json(bottles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch receive bottle messages" });
    }
})

router.get("/get_reply_num/:storyId", async (req, res) => {
    const { storyId } = req.params;
    try {
        const replies = await ReplyService.getRepliesForStory(Number(storyId));
        res.json({ reply_num: replies.length });
    } catch (error) {
        res.status(500).json({ error: "Failed to get reply num by story" });
    }
})

/**
 * @route POST /createTxn
 * @desc 创建一笔新的交易
 */
router.post("/createTxn", async (req, res) => {
    const { objectId, replyId, sender, receiver, amount, tokenType } = req.body;

    if (!objectId || !replyId || !sender || !receiver || !amount || !tokenType) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const response = await TxnService.createNewTransaction(objectId, replyId, sender, receiver, amount, tokenType);
    res.json(response);
});

/**
 * @route GET /getTxnByReply/:replyId
 * @desc 根据 replyId 获取绑定的交易信息
 */
router.get("/getTxnByReply/:replyId", async (req, res) => {
    const { replyId } = req.params;

    if (!replyId) {
        return res.status(400).json({ success: false, message: "Reply ID is required" });
    }

    const response = await TxnService.fetchTransactionByReply(replyId);
    res.json(response);
});

/**
 * @route PUT /updateTxn
 * @desc 更新交易状态
 */
router.put("/updateTxn", async (req, res) => {
    const { objectId, status } = req.body;

    if (!objectId || !status) {
        return res.status(400).json({ success: false, message: "Object ID and status are required" });
    }

    const response = await TxnService.modifyTransactionStatus(objectId, status);
    res.json(response);
});

/**
 * @route POST /claim
 * @desc 领取交易
 */
router.post("/claim", async (req, res) => {
    const { receiver, objectId } = req.body;

    if (!receiver || !objectId) {
        return res.status(400).json({ success: false, message: "Receiver and Object ID are required" });
    }

    const response = await TxnService.claimUserTransaction(receiver, objectId);
    res.json(response);
});

/**
 * @route POST /userSession
 * @desc 用户支付并创建会话
 */
router.post("/userSession", async (req, res) => {
    const { txnObjectId, sessionId, userAddress, receiverAddress, amount, tokenType } = req.body;

    if (!txnObjectId || !sessionId || !userAddress || !receiverAddress || !amount || !tokenType) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const response = await TxnService.startUserSession(txnObjectId, sessionId, userAddress, receiverAddress, amount, tokenType);
        res.json({ success: true, data: response });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route POST /aiCreateNft
 * @desc AI 创建 NFT
 */
router.post("/aiCreateNft", async (req, res) => {
    const { nftObjectId, userAddress } = req.body;

    if (!nftObjectId || !userAddress) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const response = await TxnService.aiReplyWithNFT(nftObjectId, userAddress);
        res.json({ success: true, data: response });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route GET /userSession/:userAddress
 * @desc 获取用户的活动会话
 */
router.get("/userSession", async (req, res) => {
    const { userAddress } = req.query;

    if (!userAddress) {
        return res.status(400).json({ success: false, message: "User address is required" });
    }

    try {
        const session = await TxnService.getActiveSession(userAddress.toString());
        res.json({ success: true, session });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route POST /destroySession
 * @desc AI 端销毁会话
 */
router.post("/destroySession", async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    try {
        await TxnService.destroySession(sessionId);
        res.json({ success: true, message: "Session destroyed successfully." });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route POST /claimRewards
 * @desc 领取 AI 会话奖励（NFT）
 */
router.post("/claimRewards", async (req, res) => {
    const { userAddress } = req.body;

    if (!userAddress) {
        return res.status(400).json({ success: false, message: "User address is required" });
    }

    try {
        const response = await TxnService.claimRewards(userAddress);
        res.json({ success: true, data: response });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;