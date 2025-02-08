import { replyStory, getReplyByStoryId, Reply, markReplyRead, markReplyUnread, reply, getNewReplyByToAddress, getStoryById } from '../database/storyDB';

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

    static async getRepliesForStoryByUser(address: string, storyId: number) {
        try {
            // 获取该 StoryId 的所有回复
            const replies = await getReplyByStoryId(storyId);

            // 过滤掉不符合条件的回复，只保留 `author_address` 或 `to_address` 是 `address` 的记录
            const filteredReplies = replies.filter(
                (reply) => reply.author_address === address || reply.to_address === address
            );

            // 用 Map 结构分组
            const groupedReplies = new Map<string, Reply[]>();

            for (const reply of filteredReplies) {
                const key1 = `${reply.author_address}-${reply.to_address}`;
                const key2 = `${reply.to_address}-${reply.author_address}`;
                const key = groupedReplies.has(key1) ? key1 : key2;

                if (!groupedReplies.has(key)) {
                    groupedReplies.set(key, []);
                }
                groupedReplies.get(key)!.push(reply);
            }

            return groupedReplies;
        } catch (error) {
            console.error(`❌ 获取 story ${storyId} 的 replies 失败:`, error);
            throw error;
        }
    }

    /**
     * 发布Story回复
     */
    static async replyStory(fromAddress: string, storyId: string, content: string) {
        if (content.length === 0) {
            throw new Error("Reply content cannot be empty.");
        }
        const toAddress = (await getStoryById(storyId)).author_address;
        const _reply = await reply(fromAddress, storyId, content, toAddress);
        //console.log(_reply)
        if (_reply == null) {
            throw new Error("Reply failed!");
        }
        return _reply;
    }

    /**
     * 发布回复
     */
    static async replyBack(fromAddress: string, storyId: string, content: string, toAddress: string) {
        if (content.length === 0) {
            throw new Error("Reply content cannot be empty.");
        }
        const _reply = await reply(fromAddress, storyId, content, toAddress);
        if (_reply == null) {
            throw new Error("Reply failed!");
        }
        return _reply;
    }

    /**
     * 获取新回复
     */
    static async getNewReply(address: string): Promise<Reply[]> {
        return getNewReplyByToAddress(address);
    }


    /**
     * 标记回复已读
     */
    static async markReplyRead(replies: string[]) {
        for (const reply_id of replies) {
            markReplyRead(reply_id);
        }
    }

    /**
     * 标记回复未读
     */
    static async markReplyUnread(replies: string[]) {
        for (const reply_id of replies) {
            markReplyUnread(reply_id);
        }
    }
}