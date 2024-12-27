import { Room, Client } from "@colyseus/core";
import { MapSchema, Schema, type } from "@colyseus/schema";
import { StoryService } from "../services/storyServices";
import { UserService } from "../services/userService";

class Player extends Schema {
  @type("string")
  address: string;
}

export class TavernState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
}

export class TavernRoom extends Room<TavernState> {
  maxClients = 10;

  onCreate(options: any) {
    this.setState(new TavernState());

    // 注册消息处理器
    this.onMessage("userLogin", this.handleLogin.bind(this));
    this.onMessage("publishStory", this.handlePublishStory.bind(this));
    this.onMessage("fetchStory", this.handleFetchStories.bind(this));
    this.onMessage("sendWhiskey", this.handleSendWhiskey.bind(this));
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
    * 处理登录请求
    */
  async handleLogin(client: Client, data: any) {
    const { address } = data;
    if (!address) {
      client.send("loginResponse", { success: false, reason: "Address is required." });
      return;
    }

    try {
      const user = await UserService.getUser(address);
      const player = new Player();
      player.address = address;
      this.state.players.set(client.sessionId, player);
      console.log(`Client ${client.sessionId} logged in with address ${user.address}`);
      client.send("loginResponse", { success: true });
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
}


