# Welcome to Colyseus!

This project has been created using [⚔️ `create-colyseus-app`](https://github.com/colyseus/create-colyseus-app/) - an npm init template for kick starting a Colyseus project in TypeScript.

[Documentation](http://docs.colyseus.io/)

## :crossed_swords: Usage

Start the server ( runs `ts-node-dev index.ts`):
```shell
npm start
```

Run test cases:
```shell
npm test
```

Change your database config in `.env` and run:
```shell
source .env
```

SQL database script in `sql` folder to create tables.

## :crossed_swords: For Front-End 

- Front-end project should have Colyseus Client integrated. Install it via npm:
   ```shell
    npm install colyseus.js
   ```

- Front-end client connect to the TavernRoom using Colyseus Client:
   
   ```typescript
    import { Client } from "colyseus.js";

    const client = new Client("ws://localhost:2567"); 
    const userAddress = '0xCA67f533ACEeBd68946cDcfF047121eeE124EACA';
    const room = await client.joinOrCreate("tavern_room", { address: userAddress }); 
   ```

- Message Handler
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
            "reason": "string" // 若失败，提供失败原因
        }
        ```

        Example:
        ```typescript
        client.send("userLogin", { address: "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471" });
        client.onMessage("loginResponse", (data) => {
            if (data.success) {
                console.log("登录成功！");
            } else {
                console.error("登录失败:", data.reason);
            }
        });
        ```

    2. Publish Story
        功能：发布Story
        Request: 
        `publishStory`
        ```json
        {
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
        client.send("publishStory", { storyText: "哈哈哈哈哈哈..." });
        client.onMessage("storyPublishedResponse", (data) => {
            if (data.success) {
                console.log("故事发布成功:", data.story);
            } else {
                console.error("发布故事失败:", data.reason);
            }
        });
        ```

    3. Fetch Story
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
        client.onMessage("fetchStoriesResult", (data) => {
            if (data.success) {
                console.log("获取的故事:", data.story);
            } else {
                console.error("获取故事失败:", data.reason);
            }
        });
        ```

    4. Reply to a story
        功能：对Story发布回复
        Request: 
        `replyStory`
        ```json
        {
            "storyId": "string",
            "content": "string" 
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

    5. Reply to user
        功能：回复用户（聊天）
        Request: 
        `replyUser`
        ```json
        {
            "storyText": "string" 
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

    6. Get unread replies
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

    7. Mark replies as read
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

    8. Mark replies as unread
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

    9. Send Whiskey Point
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

    10. Get User Whiskey Point
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

    11. Update User Whiskey Point
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






