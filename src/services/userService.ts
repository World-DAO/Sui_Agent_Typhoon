import { getUserState, setUserState, UserState } from "../database/stateDB";
import { createUser, getIntimacy, getUserByAddress, getUserPoints, updateIntimacy, updateUserPoints, User } from "../database/userDB";

interface UserDailyState {
    published_num: number;
    received_num: number;
    sent_whiskey_num: number;
    date: Date;
}

export class UserService {
    /**
       * login if address exist
       * create new user if address unexist
       */
    static async getUser(address: string): Promise<User> {
        let user = await getUserByAddress(address);
        if (user == null) {
            const createdUser = await createUser(address);
            if (createdUser == null) {
                throw new Error("Failed to create user.");
            }
            user = createdUser;
        }
        await UserService.getDailyState(address);
        return user;
    }

    /**
       * get daily state of user
       * if never update in 1 day, reset
       */
    static async getDailyState(address: string): Promise<UserState> {
        const dailyState = await getUserState(address);
        let state: UserDailyState;
        if (dailyState) {
            state = dailyState;
        } else {
            // 如果没有找到当天的状态，初始化为默认值
            await setUserState(address, 0, 0, 0);
            const newState = await getUserState(address);
            if (!newState) {
                throw new Error("Failed to initialize user daily state.");
            }
            state = newState;
        }
        return dailyState;
    }

    static async getWhiskeyPoints(address: string): Promise<number> {
        return getUserPoints(address);
    }

    static async updateWhiskeyPoints(address: string, newPoints: number): Promise<User | null> {
        return updateUserPoints(address, newPoints);
    }

    static async getIntimacy(address: string): Promise<number> {
        return getIntimacy(address);
    }

    static async updateIntimacy(address: string, newIntimacy: number): Promise<User | null> {
        return updateIntimacy(address, newIntimacy);
    }

    static async getLikedStories(address: string) {
        const user = await getUserByAddress(address);
        if (!user) {
            throw new Error("User not found.");
        }

        let likedStories = user.likedStories;

        console.log(likedStories);

        // 处理 `{}` 为空数组
        if (typeof likedStories === "object" && likedStories !== null && !Array.isArray(likedStories)) {
            console.warn("⚠️ likedStories 是 `{}`，转换为空数组");
            likedStories = [];
        }

        if (typeof likedStories === "string") {
            likedStories = JSON.parse(likedStories);
        }

        // **确保 `likedStories` 是数组**
        if (!Array.isArray(likedStories)) {
            console.warn("⚠️ likedStories 不是数组，返回空数组");
            likedStories = [];
        }

        return likedStories;
    }
}