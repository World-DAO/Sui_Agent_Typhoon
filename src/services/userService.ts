interface UserDailyState {
    publishedStory: boolean;
    receivedStories: boolean;
    sentWhiskey: boolean;
    date: Date;
}

export class UserService {
    /**
       * login if address exist
       * create new user if address unexist
       */
    static async getUser(address: string) {

    }

    /**
       * login if address exist
       * create new user if address unexist
       */
    static async getDailyState(address: string) {

    }
}