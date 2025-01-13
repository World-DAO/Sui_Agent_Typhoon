// src/services/storyService.ts
import { addUserReceivedStory, addUserSentWhiskey, getUserState } from '../database/stateDB';
import { publishStory, getRandomStory, getStoryByAuthor, Story, addWhiskeyPoints, getStoryById, reply, getReplyByToAddress, Reply, getNewReplyByToAddress, markReplyRead } from '../database/storyDB';
import { getUserPoints, updateUserPoints } from '../database/userDB';

export class StoryService {
    /**
     * 发布故事
     * @param authorAddress 用户地址
     * @param content 故事内容
     * @returns 发布的故事实例
     */
    static async publishUserStory(authorAddress: string, content: string): Promise<Story> {
        // Story 长度验证
        if (content.length < 50) {
            throw new Error("Story content to short!");
        }
        // 每日数量限制验证
        let userState = await getUserState(authorAddress);
        if (userState.published_num >= 1) {
            throw new Error("Reach daily publish story limit!");
        }
        const story = await publishStory(authorAddress, content);
        return story;
    }

    /**
     * 获取随机故事
     * @returns 故事实例
     */
    static async fetchRandomStory(address: string): Promise<Story> {
        // 每日数量限制验证
        let userState = getUserState(address);
        if ((await userState).received_num >= 300) {
            throw new Error("Reach daily recieve story limit!");
        }
        const story = await getRandomStory();
        // 更新状态
        await addUserReceivedStory(address);
        return story;
    }

    /**
     * 获取作者的所有故事
     * @param authorAddress 地址
     * @returns 故事数组
     */
    static async getStoryByAuthor(authorAddress: string): Promise<Story[]> {
        const stories = await getStoryByAuthor(authorAddress);
        return stories;
    }

    /**
     * 赠送威士忌积分
     * @param fromAddress 
     * @param storyId 
     */
    static async sendWhiskey(fromAddress: string, storyId: string) {
        const story = await getStoryById(storyId);
        let toAddress = story.author_address;
        // 每日数量限制
        let userState = getUserState(fromAddress);
        if ((await userState).sent_whiskey_num >= 30) {
            throw new Error("Reach daily sent whiskey limit!");
        }


        // 更新账户与故事积分数据
        let fromAddressPoints = await getUserPoints(fromAddress);
        if (fromAddressPoints <= 0) {
            throw new Error("Not enough whiskey points!");
        }
        await updateUserPoints(fromAddress, fromAddressPoints - 1);

        let toAddressPoints = await getUserPoints(toAddress);
        //console.log(toAddressPoints)
        await updateUserPoints(toAddress, toAddressPoints + 1);

        //更新每日状态
        await addUserSentWhiskey(fromAddress);
        await addWhiskeyPoints(storyId);
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
    static async markReplyRead(reply_id: string) {
        markReplyRead(reply_id);
    }
}
