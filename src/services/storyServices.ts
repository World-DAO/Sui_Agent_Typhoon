// src/services/storyService.ts
import { addUserReceivedStory, addUserSentWhiskey, getUserState } from '../database/stateDB';
import { publishStory, getRandomStory, getStoryByAuthor, Story, addWhiskeyPoints, getStoryById, reply, getReplyByToAddress, Reply, getNewReplyByToAddress, markReplyRead, markReplyUnread, deleteStory } from '../database/storyDB';
import { getUserPoints, updateUserPoints } from '../database/userDB';
import { STORY_LIMITS } from "../constants";

export class StoryService {
    /**
     * 发布故事
     * @param authorAddress 用户地址
     * @param content 故事内容
     * @returns 发布的故事实例
     */
    static async publishUserStory(authorAddress: string, title: string, content: string): Promise<Story> {
        // Story 长度验证
        if (content.length < STORY_LIMITS.MIN_WORD) {
            throw new Error("Story content to short!");
        }
        // 每日数量限制验证
        let userState = await getUserState(authorAddress);
        if (userState.published_num >= STORY_LIMITS.MAX_PUBLISH) {
            throw new Error("Reach daily publish story limit!");
        }
        const story = await publishStory(authorAddress, title, content);
        return story;
    }

    /**
     * 删除故事
     * @param authorAddress 用户地址
     * @param storyId 故事Id
     * @returns 删除是否成功
     */
    static async deleteStory(authorAddress: string, storyId: string): Promise<boolean> {
        const story = await getStoryById(storyId);
        if (story.author_address != authorAddress) {
            throw new Error("This is not your story!");
        }
        return deleteStory(storyId);
    }

    /**
     * 获取个人全部故事
     * @returns 故事列表
     */
    static async getAllStory(address: string): Promise<Story[]> {
        const stories = getStoryByAuthor(address);
        return stories;
    }

    /**
     * 获取随机故事
     * @returns 故事实例
     */
    static async fetchRandomStory(address: string): Promise<Story> {
        // 每日数量限制验证
        let userState = getUserState(address);
        if ((await userState).received_num >= STORY_LIMITS.MAX_FETCH) {
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
        if ((await userState).sent_whiskey_num >= STORY_LIMITS.MAX_WHISKEY) {
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

    static async markLikedStory(address: string, storyId: string) {
        await StoryService.markLikedStory(address, storyId);
    }
}
