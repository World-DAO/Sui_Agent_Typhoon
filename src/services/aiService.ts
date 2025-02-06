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
            const user = getUserByAddress(address);
            if (!user) {
                throw new Error("User not found.");
            }
            const likedStories = (await user).likedStories;
            if (!Array.isArray(likedStories)) {
                throw new Error("Invalid likedStories format.");
            }
            const stories = await Promise.all(
                likedStories.map(async (item: { story_id: string }) => {
                    return await getStoryById(item.story_id);
                })
            );
            return { success: true, data: stories };
        } catch (error) {
            return { success: false, error: error };
        }
    }
}