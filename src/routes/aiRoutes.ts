import express from "express";
import { aiService } from "../services/aiService";
import { StoryService } from "../services/storyServices";
import { UserService } from "../services/userService";

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

export default router;