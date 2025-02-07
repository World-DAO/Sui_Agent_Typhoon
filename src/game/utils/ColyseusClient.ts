import { Client, Room } from "colyseus.js";

const COLYSEUS_SERVER = "ws://47.236.128.7:2567";
//const COLYSEUS_SERVER = "ws://localhost:2567";

class ColyseusClient {
    private static instance: ColyseusClient;
    private client: Client;
    private room: Room | null = null;

    private constructor() {
        this.client = new Client(COLYSEUS_SERVER);
    }

    public static getInstance(): ColyseusClient {
        if (!ColyseusClient.instance) {
            ColyseusClient.instance = new ColyseusClient();
        }
        return ColyseusClient.instance;
    }

    public async joinRoom(walletAddress: string): Promise<Room> {
        if (this.room) {
            console.warn("⚠️ 已经连接到房间:", this.room.id);
            return this.room;
        }

        try {
            console.log("🎮 正在连接 Colyseus 服务器...");
            this.room = await this.client.joinOrCreate("tavern_room", {
                walletAddress,
            });
            console.log(`✅ 成功加入房间: ${this.room.id}, sessionId: ${this.room.sessionId}`);
            return this.room;
        } catch (error) {
            console.error("❌ 连接 Colyseus 失败:", error);
            throw error;
        }
    }

    public sendMessage(action: string, data: any) {
        if (this.room) {
            this.room.send(action, data);
        } else {
            console.error("⚠️ 尚未加入房间，无法发送消息");
        }
    }

    public onMessage(action: string, callback: (data: any) => void) {
        if (this.room) {
            this.room.onMessage(action, callback);
        } else {
            console.error("⚠️ 尚未加入房间，无法监听消息");
        }
    }

    public leaveRoom() {
        if (this.room) {
            console.log(`❌ 断开 Colyseus 连接: ${this.room.id}`);
            this.room.leave();
            this.room = null;
        }
    }
}

export default ColyseusClient.getInstance();