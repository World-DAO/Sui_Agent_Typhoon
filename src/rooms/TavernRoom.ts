import { Room, Client } from "@colyseus/core";
import { MapSchema, Schema, type } from "@colyseus/schema";
import { StoryService } from "../services/storyServices";
import { UserService } from "../services/userService";
import { ReplyService } from "../services/replyService";
import { ethers } from "ethers";
import { generateJWT, verifyJWT, recoverAddress } from "../utils/jwtUtils";

class Player extends Schema {
  @type("string")
  address: string;
}

export class TavernState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type({ map: "string" })
  loginChallenges = new MapSchema<string>();
}

export class TavernRoom extends Room<TavernState> {
  maxClients = 10;

  onCreate(options: any) {
    this.setState(new TavernState());

    // 注册消息处理器
    this.onMessage("userLogin", this.handleLogin.bind(this));
    this.onMessage("loginSignature", this.handleLoginSignature.bind(this));
    this.onMessage("publishStory", this.handlePublishStory.bind(this));
    this.onMessage("deleteStory", this.handleDeleteStory.bind(this));
    this.onMessage("getAllStory", this.handleGetAllStory.bind(this));
    this.onMessage("fetchStory", this.handleFetchStories.bind(this));
    this.onMessage("sendWhiskey", this.handleSendWhiskey.bind(this));
    this.onMessage("getWhiskeyPoints", this.handleGetWhiskeyPoints.bind(this));
    this.onMessage("updateWhiskeyPoints", this.handleUpdateWhiskeyPoints.bind(this));
    this.onMessage("replyStory", this.handleReplyStory.bind(this));
    this.onMessage("replyUser", this.handleReply.bind(this));
    this.onMessage("getNewReply", this.handleGetNewReply.bind(this));
    this.onMessage("markRepliesRead", this.handleMarkRepliesRead.bind(this));
    this.onMessage("markRepliesUnread", this.handleMarkRepliesUnread.bind(this));
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  /**
     * 验证 JWT 并返回用户地址
     * @param token - JWT 字符串
     * @returns 用户地址或 null
     */
  private verifyClientJWT(token: string): string | null {
    const decoded = verifyJWT(token);
    if (decoded && 'address' in decoded) {
      return (decoded as any).address;
    }
    return null;
  }

  /**
   * 一个通用的认证方法，用于在处理其他消息时验证 JWT
   * @param client - Colyseus 客户端
   * @returns 用户地址或 null
   */
  private authenticate(client: Client): string | null {
    const token = client.auth.jwt; // 假设前端在连接时发送 JWT
    if (!token) {
      client.send("error", { message: "No JWT provided." });
      return null;
    }

    const address = this.verifyClientJWT(token);
    if (!address) {
      client.send("error", { message: "Invalid JWT." });
      return null;
    }

    return address;
  }


  /**
    * 处理登录请求
    */
  async handleLogin(client: Client, data: any) {
    const { address } = data;
    if (!address) {
      client.send("loginResponse", { success: false, reason: "Address is required." });
      return;
    }

    // 生成一个随机的挑战消息（nonce）
    const challenge = ethers.hexlify(ethers.randomBytes(32));
    // 存储挑战消息，关联到客户端的 sessionId
    this.state.loginChallenges.set(client.sessionId, challenge);
    const player = new Player();
    player.address = address;
    this.state.players.set(client.sessionId, player);
    console.log(`Player ${address} logged in with session ${client.sessionId} and challenge ${challenge}`);

    // 发送挑战消息给前端
    client.send("loginChallenge", { challenge });
  }

  /**
    * 处理用户签名验证请求，生成 JWT
    */
  async handleLoginSignature(client: Client, data: any) {
    const { signature } = data;
    const challenge = this.state.loginChallenges.get(client.sessionId);

    if (!challenge) {
      client.send("loginResponse", { success: false, reason: "No challenge found. Please initiate login again." });
      return;
    }

    // 获取用户地址
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("loginResponse", { success: false, reason: "User not authenticated." });
      return;
    }

    try {
      // 验证签名
      const recoveredAddress = recoverAddress(challenge, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Signature verification failed.");
      }
      // 签名验证通过，生成 JWT
      const token = generateJWT({ address });
      // 发送 JWT 给前端
      client.send("loginResponse", { success: true, token });
      // 清除已使用的挑战消息
      this.state.loginChallenges.delete(client.sessionId);
    } catch (error: any) {
      client.send("loginResponse", { success: false, reason: error.message });
    }
  }


  /**
   * 处理发布故事请求
   */
  async handlePublishStory(client: Client, data: any) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }

    const { storyText } = data;

    try {
      const story = await StoryService.publishUserStory(address, storyText);
      client.send("storyPublishedResponse", { success: true, story });
    } catch (error: any) {
      client.send("storyPublishedResponse", { success: false, reason: error.message });
    }
  }

  /**
   * 处理删除故事请求
   */
  async handleDeleteStory(client: Client, data: any) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    const { storyId } = data;
    try {
      await StoryService.deleteStory(address, storyId);
      client.send("deleteStoryResponse", { success: true });
    } catch (error: any) {
      client.send("deleteStoryResponse", { success: false, reason: error.message });
    }
  }

  /**
   * 处理获取故事列表请求
   */
  async handleGetAllStory(client: Client) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      const stories = await StoryService.getAllStory(address);
      client.send("getAllStoryResponse", { success: true, stories });
    }
    catch (error: any) {
      client.send("getAllStoryResponse", { success: false, reason: error.message });
    }
  }

  /**
   * 处理领取故事请求
   */
  async handleFetchStories(client: Client) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      const story = await StoryService.fetchRandomStory(address);
      client.send("fetchStoriesResult", { success: true, story });
    } catch (error: any) {
      client.send("fetchStoriesResult", { success: false, reason: error.message });
    }
  }

  /**
   * 处理赠送威士忌请求
   */
  async handleSendWhiskey(client: Client, storyId: string) {
    //console.log("id: " + storyId);
    const fromAddress = this.state.players.get(client.sessionId)?.address;
    if (!fromAddress) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      await StoryService.sendWhiskey(fromAddress, storyId);
      client.send("whiskeySent", { success: true });
    } catch (error: any) {
      client.send("whiskeySent", { success: false, reason: error.message });
    }
  }

  /**
   * 处理读取积分请求
   */
  async handleGetWhiskeyPoints(client: Client) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      const points = UserService.getWhiskeyPoints(address);
      client.send("getWhiskeyPointsResponse", { success: true, points });
    } catch (error: any) {
      client.send("getWhiskeyPointsResponse", { success: false, reason: error.message });
    }
  }

  /**
   * 处理更新积分请求
   */
  async handleUpdateWhiskeyPoints(client: Client, newPoints: number) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      const user = UserService.updateWhiskeyPoints(address, newPoints);
      client.send("updateWhiskeyPointsResponse", { success: true, user });
    } catch (error: any) {
      client.send("updateWhiskeyPointsResponse", { success: false, reason: error.message });
    }
  }

  /**
    * 处理回复故事请求
    */
  async handleReplyStory(client: Client, data: any) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }

    const { storyId, content } = data;

    try {
      const reply = await ReplyService.replyStory(address, storyId, content);
      client.send("replyStoryResponse", { success: true, reply });

      // 广播新回复给在线的用户
      this.broadcast("newReply", { success: true, reply });
    } catch (error: any) {
      client.send("replyStoryResponse", { success: false, reason: error.message });
    }
  }

  /**
    * 处理回复请求
    */
  async handleReply(client: Client, data: any) {
    const from_address = this.state.players.get(client.sessionId)?.address;
    if (!from_address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }

    const { to_address, content } = data;

    try {
      const reply = await ReplyService.replyBack(from_address, content, to_address);
      client.send("replyResponse", { success: true, reply });

      // 广播新回复给在线的用户
      this.broadcast("newReply", { success: true, reply });
    } catch (error: any) {
      client.send("replyResponse", { success: false, reason: error.message });
    }
  }

  /**
    * 处理获取新回复请求
    */
  async handleGetNewReply(client: Client) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      const replies = await ReplyService.getNewReply(address);
      //console.log(replies);
      client.send("getNewReplyResponse", { success: true, replies });
    } catch (error: any) {
      client.send("getNewReplyResponse", { success: false, reason: error.message });
    }
  }

  /***
   * 处理标记已读请求
   */
  async handleMarkRepliesRead(client: Client, replies: string[]) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      await ReplyService.markReplyRead(replies);
      client.send("markRepliesReadResponse", { success: true });
    } catch (error: any) {
      client.send("markRepliesReadResponse", { success: false, reason: error.message });
    }
  }

  /***
   * 处理标记未读请求
   */
  async handleMarkRepliesUnread(client: Client, replies: string[]) {
    const address = this.state.players.get(client.sessionId)?.address;
    if (!address) {
      client.send("error", { message: "User not authenticated." });
      return;
    }
    try {
      await ReplyService.markReplyUnread(replies);
      client.send("markRepliesUnreadResponse", { success: true });
    } catch (error: any) {
      client.send("markRepliesUnreadResponse", { success: false, reason: error.message });
    }
  }
}


