import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../src/app.config";
import { TavernState } from "../src/rooms/TavernRoom";
import { resolve } from "path";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

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

  it("should fetch unread replies", async () => {
    const address = '0xCA67f533ACEeBd68946cDcfF047121eeE124EACA';
    const room = await colyseus.createRoom<TavernState>("tavern_room", { address });
    const client1 = await colyseus.connectTo(room, { address });
    // login
    client1.send("userLogin", { address });
    const loginResponse = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      client1.onMessage("loginResponse", (data) => {
        resolve(data);
        console.log("loginResponse: ", data);
      });
    })
    assert.strictEqual(loginResponse.success, true);

    // fetch unread replies
    client1.send("getNewReply");
    const getNewRepliesResponse = await new Promise<{ success: boolean; replies?: any }>((resolve) => {
      client1.onMessage("getNewReplyResponse", (data) => {
        resolve(data);
        console.log("getNewReplyResponse: ", data);
      });
    })
    assert.strictEqual(getNewRepliesResponse.success, true);

    // mark read
    const replies: string[] = [];
    for (const reply of getNewRepliesResponse.replies) {
      replies.push(reply.id);
    }
    client1.send("markRepliesRead", replies);
    const markRepliesReadResponse = await new Promise<{ success: boolean }>((resolve) => {
      client1.onMessage("markRepliesReadResponse", (data) => {
        resolve(data);
        console.log("markRepliesReadResponse: ", data);
      });
    })
    assert.strictEqual(markRepliesReadResponse.success, true);

    // fetch unread replies again
    client1.send("getNewReply");
    const _getNewRepliesResponse = await new Promise<{ success: boolean; replies?: any }>((resolve) => {
      client1.onMessage("getNewReplyResponse", (data) => {
        resolve(data);
        console.log("getNewReplyResponse: ", data);
      });
    })
    assert.strictEqual(_getNewRepliesResponse.success, true);

  });

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
