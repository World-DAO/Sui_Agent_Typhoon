import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../src/app.config";
import { TavernState } from "../src/rooms/TavernRoom";
import { resolve } from "path";
import { expect } from 'chai';
import { Client } from 'colyseus.js';
import { ethers } from "ethers";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("should perform login and fetch unread replies", async function () {
    // 初始化 Colyseus 客户端
    const serverUrl = "ws://47.236.128.7:2567";
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

    // 离开当前房间
    await room.leave();
  });

  // it("connecting into a room", async () => {
  //   // `room` is the server-side Room instance reference.
  //   const room = await colyseus.createRoom<TavernState>("tavern_room", { address: '0xCA67f533ACEeBd68946cDcfF047121eeE124EACA' });

  //   // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
  //   const client1 = await colyseus.connectTo(room, { address: '0xCA67f533ACEeBd68946cDcfF047121eeE124EACA' });

  //   // make your assertions
  //   assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

  //   // wait for state sync
  //   await room.waitForNextPatch();

  //   const expectedInitialState = {
  //     players: {},
  //   };

  //   assert.deepStrictEqual(expectedInitialState, client1.state.toJSON());
  // });

  // it("should handle publishing a story correctly", async () => {
  //   const address = '0xCA67f533ACEeBd68946cDcfF047121eeE124EACA';
  //   const room = await colyseus.createRoom<TavernState>("tavern_room", { address });
  //   const client1 = await colyseus.connectTo(room, { address });
  //   // login
  //   client1.send("userLogin", { address });
  //   const loginResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
  //     client1.onMessage("loginResponse", (data) => {
  //       resolve(data);
  //       console.log(data);
  //     });
  //   })
  //   assert.strictEqual(loginResponse.success, true);


  //   // Simulate publishing a story
  //   const storyText = "这是一个测试故事，哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈。";
  //   // Send publishStory message
  //   client1.send("publishStory", { storyText });
  //   // Listen for publishStoryResponse
  //   const publishResponse = await new Promise<{ success: boolean; story?: any; reason?: string }>((resolve) => {
  //     client1.onMessage("storyPublishedResponse", (data) => {
  //       resolve(data);
  //       console.log(data);
  //     });
  //     client1.onMessage('error', (data) => {
  //       console.error('Error message received:', data);
  //     });
  //   });
  //   console.log(publishResponse.story)
  //   // Assert publishing was successful
  //   assert.strictEqual(publishResponse.success, true);
  //   assert.ok(publishResponse.story);
  //   assert.strictEqual(publishResponse.story.author_address, address);
  //   assert.strictEqual(publishResponse.story.story_content, storyText);
  // });

  // it("should handle fetching a story correctly", async () => {
  //   const address = '0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471';
  //   const room = await colyseus.createRoom<TavernState>("tavern_room", { address });
  //   const client1 = await colyseus.connectTo(room, { address });
  //   // login
  //   client1.send("userLogin", { address });
  //   const loginResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
  //     client1.onMessage("loginResponse", (data) => {
  //       resolve(data);
  //       console.log("loginResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(loginResponse.success, true);

  //   //Simulate fetching a story
  //   client1.send("fetchStory");
  //   const fetchResponse = await new Promise<{ success: boolean; story?: any; reason?: string }>((resolve) => {
  //     client1.onMessage("fetchStoriesResult", (data) => {
  //       resolve(data);
  //       console.log("fetchStoryResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(fetchResponse.success, true);
  //   //assert.ok(fetchResponse.story);

  //   //Simulate Reply the story
  //   const storyId = fetchResponse.story.id;
  //   const content = "Good!";
  //   client1.send("replyStory", { storyId, content });
  //   const replyResponse = await new Promise<{ success: boolean; reply?: any }>((resolve) => {
  //     client1.onMessage("replyResponse", (data) => {
  //       resolve(data);
  //       console.log("replyResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(replyResponse.success, true);
  // });

  // it("should fetch unread replies", async () => {
  //   const address = '0xCA67f533ACEeBd68946cDcfF047121eeE124EACA';
  //   const room = await colyseus.createRoom<TavernState>("tavern_room", { address });
  //   const client1 = await colyseus.connectTo(room, { address });
  //   // login
  //   client1.send("userLogin", { address });
  //   const loginResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
  //     client1.onMessage("loginResponse", (data) => {
  //       resolve(data);
  //       console.log("loginResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(loginResponse.success, true);

  //   // fetch unread replies
  //   client1.send("getNewReply");
  //   const getNewRepliesResponse = await new Promise<{ success: boolean; replies?: any }>((resolve) => {
  //     client1.onMessage("getNewReplyResponse", (data) => {
  //       resolve(data);
  //       console.log("getNewReplyResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(getNewRepliesResponse.success, true);

  //   // mark read
  //   const replies: string[] = [];
  //   for (const reply of getNewRepliesResponse.replies) {
  //     replies.push(reply.id);
  //   }
  //   client1.send("markRepliesRead", replies);
  //   const markRepliesReadResponse = await new Promise<{ success: boolean }>((resolve) => {
  //     client1.onMessage("markRepliesReadResponse", (data) => {
  //       resolve(data);
  //       console.log("markRepliesReadResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(markRepliesReadResponse.success, true);

  //   // fetch unread replies again
  //   client1.send("getNewReply");
  //   const _getNewRepliesResponse = await new Promise<{ success: boolean; replies?: any }>((resolve) => {
  //     client1.onMessage("getNewReplyResponse", (data) => {
  //       resolve(data);
  //       console.log("getNewReplyResponse: ", data);
  //     });
  //   })
  //   assert.strictEqual(_getNewRepliesResponse.success, true);

  // });

  // it("should send a wiskey point correctly", async () => {
  //   const address = '0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471';
  //   const room = await colyseus.createRoom<TavernState>("tavern_room", { address });
  //   const client1 = await colyseus.connectTo(room, { address });
  //   // login
  //   client1.send("userLogin", { address });
  //   const loginResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
  //     client1.onMessage("loginResponse", (data) => {
  //       resolve(data);
  //       console.log(data);
  //     });
  //   })
  //   assert.strictEqual(loginResponse.success, true);
  //   // fetch story
  //   client1.send("fetchStory");
  //   const fetchResponse = await new Promise<{ success: boolean; story?: any; reason?: string }>((resolve) => {
  //     client1.onMessage("fetchStoriesResult", (data) => {
  //       resolve(data);
  //       console.log(data);
  //     });
  //   })
  //   assert.strictEqual(fetchResponse.success, true);
  //   // send whiskey
  //   const story_id = fetchResponse.story.id;
  //   client1.send("sendWhiskey", story_id);
  //   const whiskeyResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
  //     client1.onMessage("whiskeySent", (data) => {
  //       resolve(data);
  //       console.log(data);
  //     });
  //   })
  //   assert.strictEqual(whiskeyResponse.success, true);
  // });
});
