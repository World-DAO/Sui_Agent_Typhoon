import { getChatHistory, saveChatMessage } from "../database/chatDB";
import { getStoryByAuthor, getStoryById } from "../database/storyDB";
import { getUserByAddress } from "../database/userDB";

export class aiService {
    static async getChatHistory(userId: string, prevCnt: number) {
        try {
            const history = await getChatHistory(userId, prevCnt);
            return { success: true, data: history };
        } catch (error) {
            return { success: false, error: error };
        }
    }

    static async saveChatHistory(userId: string, role: "user" | "ai", content: string) {
        try {
            await saveChatMessage(userId, role, content);
            return { success: true };
        } catch (error) {
            return { success: false, error: error };
        }
    }

    static async getStoryByAuthor(authorAddress: string) {
        try {
            const stories = await getStoryByAuthor(authorAddress);
            return { success: true, data: stories };
        } catch (error) {
            return { success: false, error: error };
        }
    }

    static async getLikedStories(address: string) {
        try {
            const user = await getUserByAddress(address);
            if (!user) {
                throw new Error("User not found.");
            }

            const likedStories = user.likedStories;
            if (!Array.isArray(likedStories)) {
                throw new Error("Invalid likedStories format.");
            }

            const stories = await Promise.all(
                likedStories.map(async (item: { story_id?: string }) => {
                    if (!item.story_id) {
                        console.warn("⚠️ 跳过无效的 story_id:", item);
                        return null;
                    }
                    return await getStoryById(item.story_id);
                })
            );

            return { success: true, data: stories.filter(story => story !== null) };
        } catch (error) {
            return { success: false, error: error };
        }
    }
}