import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../src/app.config";
import { TavernState } from "../src/rooms/TavernRoom";
import { resolve } from "path";
import { expect } from 'chai';
import { Client } from 'colyseus.js';
import { ethers } from "ethers";
import { Reply } from "../src/database/storyDB";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("should perform login StoryTeller", async function () {
    // 初始化 Colyseus 客户端
    const serverUrl = "ws://47.236.128.7:2567";
    //const serverUrl = "ws://localhost:2567";
    const client = new Client(serverUrl);

    const testPrivateKey = '8474d4c25d6a68f49ab51fe6061a01bbffd3d113cf1c25beeefc2a6ef74bc86d';
    const wallet = new ethers.Wallet(testPrivateKey);
    const address = wallet.address;

    // 连接并创建房间
    const room = await client.joinOrCreate<TavernState>("tavern_room", { address });

    // 发送 userLogin 消息
    room.send("userLogin", { address });

    // 接收 loginChallenge 消息
    const loginChallenge = await new Promise<{ challenge: string }>((resolve, reject) => {
      room.onMessage("loginChallenge", (data) => {
        if (data.challenge) {
          resolve(data);
        } else {
          reject(new Error("No challenge received"));
        }
      });

      // 超时处理
      setTimeout(() => reject(new Error("loginChallenge timeout")), 5000);
    });
    console.log("Received loginChallenge:", loginChallenge);

    // 使用测试钱包签名挑战消息
    const signature = await wallet.signMessage(loginChallenge.challenge);

    // 发送 loginSignature 消息
    room.send("loginSignature", { signature });

    // 接收 loginResponse 消息
    const loginResponse = await new Promise<{ success: boolean; token?: string; reason?: string }>((resolve, reject) => {
      room.onMessage("loginResponse", (data) => {
        resolve(data);
      });

      // 超时处理
      setTimeout(() => reject(new Error("loginResponse timeout")), 5000);
    });

    console.log("Received loginResponse:", loginResponse);

    expect(loginResponse.success).to.be.true;
    expect(loginResponse.token).to.be.a('string');

    const token = loginResponse.token!;
    expect(token).to.have.length.greaterThan(0);

    const title = "Test";
    const storyText = "这是一个测试故事，哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈。";
    // Send publishStory message
    room.send("publishStory", { title, storyText });
    // Listen for publishStoryResponse
    const publishResponse = await new Promise<{ success: boolean; story?: any; reason?: string }>((resolve) => {
      room.onMessage("storyPublishedResponse", (data) => {
        resolve(data);
        console.log(data);
      });
      room.onMessage('error', (data) => {
        console.error('Error message received:', data);
      });
    });
    // Assert publishing was successful
    assert.strictEqual(publishResponse.success, true);
    assert.ok(publishResponse.story);
    assert.strictEqual(publishResponse.story.author_address, address);
    assert.strictEqual(publishResponse.story.story_content, storyText);

    // 获取未读评论
    room.send("getNewReply");
    const getNewReplyResponse = await new Promise<{ success: boolean; newReplies: Reply[] }>((resolve) => {
      room.onMessage("newRepliesResponse", (data) => {
        resolve(data);
        console.log("newRepliesResponse", data);
      });
    })
    assert.strictEqual(getNewReplyResponse.success, true)

    // const newReply = getNewReplyResponse.newReplies[0];
    // const targetUserAddress = newReply.author_address;
    // const storyId = newReply.story_id;
    // const replyText = "Thanks!";

    // 回复评论
    // room.send("replyUser", { targetUserAddress, replyText, storyId });
    // const replyUserResponse = await new Promise<{ success: boolean; reply: Reply }>((resolve) => {
    //   room.onMessage("replyUserResponse", (data) => {
    //     resolve(data);
    //     console.log(data);
    //   });
    // })
    // assert.strictEqual(replyUserResponse.success, true);

    // 离开当前房间
    await room.leave();
  });

  it("should perform login StoryReciever", async function () {
    // 初始化 Colyseus 客户端
    const serverUrl = "ws://47.236.128.7:2567";
    // const serverUrl = "ws://localhost:2567";
    const client = new Client(serverUrl);

    const testPrivateKey = 'ae40f25bfbf17152534e66905ae98621d9d3c35e1831b84fb2185496fc0c25ed';
    const wallet = new ethers.Wallet(testPrivateKey);
    const address = wallet.address;

    // 连接并创建房间
    const room = await client.joinOrCreate<TavernState>("tavern_room", { address });

    // 发送 userLogin 消息
    room.send("userLogin", { address });

    // 接收 loginChallenge 消息
    const loginChallenge = await new Promise<{ challenge: string }>((resolve, reject) => {
      room.onMessage("loginChallenge", (data) => {
        if (data.challenge) {
          resolve(data);
        } else {
          reject(new Error("No challenge received"));
        }
      });

      // 超时处理
      setTimeout(() => reject(new Error("loginChallenge timeout")), 5000);
    });
    console.log("Received loginChallenge:", loginChallenge);

    // 使用测试钱包签名挑战消息
    const signature = await wallet.signMessage(loginChallenge.challenge);

    // 发送 loginSignature 消息
    room.send("loginSignature", { signature });

    // 接收 loginResponse 消息
    const loginResponse = await new Promise<{ success: boolean; token?: string; reason?: string }>((resolve, reject) => {
      room.onMessage("loginResponse", (data) => {
        resolve(data);
      });

      // 超时处理
      setTimeout(() => reject(new Error("loginResponse timeout")), 5000);
    });

    console.log("Received loginResponse:", loginResponse);

    expect(loginResponse.success).to.be.true;
    expect(loginResponse.token).to.be.a('string');

    const token = loginResponse.token!;
    expect(token).to.have.length.greaterThan(0);

    // Simulate fetching a story
    room.send("fetchStory");
    const fetchResponse = await new Promise<{ success: boolean; story?: any; reason?: string }>((resolve) => {
      room.onMessage("fetchStoriesResult", (data) => {
        resolve(data);
        console.log("fetchStoryResponse: ", data);
      });
    })
    assert.strictEqual(fetchResponse.success, true);

    const storyId = fetchResponse.story.id;

    // Simulate Like the story
    // room.send("markLikedStory", storyId);
    // const markLikedStoryResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
    //   room.onMessage("markLikedStoryResponse", (data) => {
    //     resolve(data);
    //     console.log("markLikedStoryResponse: ", data);
    //   });
    // })
    // assert.strictEqual(markLikedStoryResponse.success, true);

    // Simulate Reply the story
    const replyText = "Good!";
    room.send("replyStory", { storyId, replyText });
    const replyResponse = await new Promise<{ success: boolean; reply?: any }>((resolve) => {
      room.onMessage("replyStoryResponse", (data) => {
        resolve(data);
        console.log("replyStoryResponse: ", data);
      });
    })
    assert.strictEqual(replyResponse.success, true);

    // 离开当前房间
    await room.leave();
  });
});
