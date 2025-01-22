# :crossed_swords: For Front-End 

- Front-end project should have Colyseus Client integrated. Install it via npm:
   ```shell
    npm install colyseus.js
   ```

- Front-end client connect to the TavernRoom using Colyseus Client:
   
   ```typescript
    import { Client } from "colyseus.js";

    const client = new Client("ws://47.236.128.7:2567"); 
    const userAddress = ''; 
    const room = await client.joinOrCreate("tavern_room", { address: userAddress }); 
   ```

## Message Handler
1. User Login
    功能：用户通过钱包地址登录，不存在则创建新用户
    Request: 
    `userLogin`
    ```json
    {
        "address": "string" 
    }
    ```

    Response:
    `loginResponse`
    ```json
    {
        "success": true, 
        "challenge": "string"
    }
    ```

    Example:
    ```typescript
    room.send("userLogin", { address: "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471" });
    const loginChallenge = await new Promise<{ challenge: string }>((resolve, reject) => {
        room.onMessage("loginChallenge", (data) => {
            if (data.challenge) {
                resolve(data);
            } else {
                reject(new Error("No challenge received"));
            }
        });
        setTimeout(() => reject(new Error("loginChallenge timeout")), 5000);
    });
    const signature = await wallet.signMessage(loginChallenge.challenge);
    ```

2. Login Signature 
    功能：签名
    Request:
    `loginSignature`
    ```json
    {
        "signature": "玩家对挑战信息的签名"
    }
    ```

    Response:
    `loginResponse`
    ```json
    {
        "success": true,
        "token": "JWT"
    }
    ```

    Example:
    ```typescript
    room.send("loginSignature", { signature });

    const loginResponse = await new Promise<{ success: boolean; token?: string; reason?: string }>((resolve, reject) => {
      room.onMessage("loginResponse", (data) => {
        resolve(data);
      });
      setTimeout(() => reject(new Error("loginResponse timeout")), 5000);
    });
    ```

3. Publish Story
    功能：发布Story
    Request: 
    `publishStory`
    ```json
    {
        "title": "string",
        "storyText": "string" 
    }
    ```

    Response:
    `storyPublishedResponse`
    ```json
    {
        "success": true, 
        "story": { /* 故事对象 */ }, // 发布成功时返回的故事信息
        "reason": "string" 
    }
    ```

    Example:
    ```typescript
    client.send("publishStory", { title:"Test", storyText: "哈哈哈哈哈哈..." });
    const publishResponse = await new Promise<{ success: boolean; story?: any; reason?: string }>((resolve) => {
      client.onMessage("storyPublishedResponse", (data) => {
        resolve(data);
        console.log(data);
      });
      client.onMessage('error', (data) => {
        console.error('Error message received:', data);
      });
    });
    ```

4. Delete Story
        功能：删除Story
    Request:
    `deleteStory`
    ```json
    {
        "storyID": "string"
    }
    ```

    Response:
    `deleteStoryResponse`
    ```json
    {
        "success": true
    }
    ```

    Example:
    ```typescript
    client.send("deleteStory", { storyId: "1" });
    const deleteStoryResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      client.onMessage("deleteStoryResponse", (data) => {
        resolve(data);
        console.log(data);
      });
      client.onMessage('error', (data) => {
        console.error('Error message received:', data);
      });
    });
    ```

5. Get All Stories by Author
    功能：获取用户发布的所有Story
    Request:
    `getAllStory`

    Response:
    `getAllStoryResponse`
    ```json
    {
        "success": true,
        "stories": Story[] //故事对象列表
    }
    ```
    Story定义：
    ```typescript
    export interface Story {
        id: number;
        author_address: string;
        title: string;
        story_content: string;
        created_at: Date;
    }
    ```

    Example:
    ```typescript
    client.send("getAllStory");
    const getAllStoryResponse = await new Promise<{ success: boolean; stories:Story[]; reason?: string }>((resolve) => {
      client.onMessage("getAllStoryResponse", (data) => {
        resolve(data);
        console.log(data);
      });
      client.onMessage('error', (data) => {
        console.error('Error message received:', data);
      });
    });
    ```

6. Fetch Story
    功能：发布Story
    Request: 
    `fetchStory`

    Response:
    `fetchStoriesResult`    
    ```json
    {
        "success": true, 
        "story": { /* 故事对象 */ }, 
        "reason": "string" 
    }
    ```

    Example:
    ```typescript
    client.send("fetchStory");
    const fetchStoriesResult = await new Promise<{ success: boolean; story:Story; reason?: string }>((resolve) => {
      client.onMessage("fetchStoriesResult", (data) => {
        resolve(data);
        console.log(data);
      });
      client.onMessage('error', (data) => {
        console.error('Error message received:', data);
      });
    });
    ```

7. Reply to a story
    功能：对Story发布回复
    Request: 
    `replyStory`
    ```json
    {
        "storyId": "string",
        "replyText": "string" 
    }
    ```

    Response:
    `replyStoryResponse`
    ```json
    {
        "success": true, 
        "reply": { /* 回复对象 */ }, 
        "reason": "string" 
    }
    ```

8.  Reply to user
    功能：回复用户（聊天）
    Request: 
    `replyUser`
    ```json
    {
        "targetAddress": "string", // 回复对象地址
        "replyText": "string",
        "storyId": "string"
    }
    ```

    Response:
    `replyResponse`
    ```json
    {
        "success": true, 
        "reply": { /* 回复对象 */ }, 
        "reason": "string" 
    }
    ```

    Example:
    ```typescript
    // 回复评论
    room.send("replyUser", { targetUserAddress, replyText, storyId });
    const replyUserResponse = await new Promise<{ success: boolean; reply: Reply }>((resolve) => {
      room.onMessage("replyUserResponse", (data) => {
        resolve(data);
        console.log(data);
      });
    })
    ```

9.  Get unread replies
    功能：获取未读回复
    Request: 
    `getNewReply`

    Response:
    `getNewReplyResponse`
    ```json
    {
        "success": true, 
        "replies": [ /* 回复对象数组 */ ],
        "reason": "string" 
    }
    ```

    Example:
    ```typescript
    client.send("getNewReply");
    client.onMessage("getNewReplyResponse", (data) => {
        if (data.success) {
            const replies = data.replies;
            const replyIds = [];
            
            // 提取所有ReplyID
            for (const reply of replies) {
                if (reply.id && typeof reply.id === 'string') {
                    replyIds.push(reply.id);
                } else {
                    console.warn("回复格式不正确:", reply);
                }
            }
            // 标记这些回复为已读（可选）
            if (replyIds.length > 0) {
                room.send("markRepliesRead", replyIds);
            }
        } else {
            console.error("获取新回复失败:", data.reason);
        }
    });
    ```

10. Mark replies as read
    功能：将指定的回复标记为已读，避免重复处理
    Request: 
    `markRepliesRead`
    ```json
    {
        "replies": ["string"] // 回复ID数组
    }
    ```

    Response:
    `markRepliesReadResponse`
    ```json
    {
        "success": true, 
        "reason": "string" 
    }
    ```

11. Mark replies as unread
    功能：将指定的回复标记为未读
    Request: 
    `markRepliesUnread`
    ```json
    {
        "replies": ["string"] // 回复ID数组
    }
    ```

    Response:
    `markRepliesUnreadResponse`
    ```json
    {
        "success": true, 
        "reason": "string" 
    }
    ```

12. Send Whiskey Point
    功能：赠送一个威士忌积分
    Request: 
    `sendWhiskey`
    ```json
    {
        "storyId": "string"  
    }
    ```

    Response:
    `whiskeySent`
    ```json
    {
        "success": true, 
        "reason": "string"
    }
    ```

13. Get User Whiskey Point
    功能：读取用户威士忌积分
    Request: 
    `getWhiskeyPoints`

    Response:
    `getWhiskeyPoints`
    ```json
    {
        "success": true, 
        "points": "number", 
        "reason": "string" 
    }
    ```

14. Update User Whiskey Point
    功能：发布Story
    Request: 
    `updateWhiskeyPoints`
    ```json
    {
        "newPoints": "number" 
    }
    ```

    Response:
    `updateWhiskeyPointsResponse`
    ```json
    {
        "success": true, 
        "user": { /* 用户对象 */ }, // 更新成功时返回用户信息
        "reason": "string" 
    }
    ```

15. Mark Story Liked
    功能：将Story加入收藏（保留）
    Request:
    `markLikedStory`
    ```json
    {
        "storyId": "string"
    }
    ```

    Response:
    `markLikedStoryResponse`
    ```json
    {
        "success": true, 
        "reason": "string" 
    }
    ```

    Example:
    ```typescript
    room.send("markLikedStory", storyId);
    const markLikedStoryResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      room.onMessage("markLikedStoryResponse", (data) => {
         resolve(data);
         console.log("markLikedStoryResponse: ", data);
       });
    })
    ```

16. Get Liked Stories
    功能：获取收藏的Story列表
    Request:
    `getLikedStories`

    Response:
    `getLikedStoriesResponse`
    ```json
    {
        "success": true, 
        "likedStories":"string[]", //StoryId 列表
        "reason": "string" 
    }
    ```

