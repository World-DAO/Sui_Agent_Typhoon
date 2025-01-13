import { replyStory, getReplyByStoryId, Reply } from '../database/storyDB';

export class ReplyService {
    /**
     * 发布一条回复
     * @param storyId 回复所属的故事ID
     * @param authorAddress 回复者的地址
     * @param content 回复内容
     * @returns 新增的回复对象
     */
    static async publishReply(address: string, storyId: string, content: string): Promise<Reply> {
        if (!content || content.trim().length === 0) {
            throw new Error('Reply content cannot be empty.');
        }

        if (content.length < 10) {
            throw new Error('Reply content must be at least 10 characters long.');
        }

        try {
            const reply = await replyStory(address, storyId, content);
            return reply;
        } catch (error) {
            console.error(`Error publishing reply by ${address} to story ${storyId}:`, error);
            throw error;
        }
    }

    /**
     * 获取某个故事的所有回复
     * @param storyId 故事的ID
     * @returns 回复数组
     */
    static async getRepliesForStory(storyId: number): Promise<Reply[]> {
        try {
            const replies = await getReplyByStoryId(storyId);
            return replies;
        } catch (error) {
            console.error(`Error fetching replies for story ${storyId}:`, error);
            throw error;
        }
    }
}