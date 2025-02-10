import { EventBus } from '../EventBus';

class AIChatClient {
    private static instance: AIChatClient;
    private isStreaming = false;
    // 直接使用服务端 API URL，不再使用代理
    private API_URL = "https://www.emptylab.org/api/chat";

    private constructor() { }

    public static getInstance(): AIChatClient {
        if (!AIChatClient.instance) {
            AIChatClient.instance = new AIChatClient();
        }
        return AIChatClient.instance;
    }

    public async sendMessage(message: string): Promise<void> {
        if (this.isStreaming) {
            console.warn("⚠️ 正在等待上一条消息的回复");
            return;
        }

        try {
            // 立即显示一个加载状态
            EventBus.emit("chat-loading", true);

            console.log("🚀 Sending message to AI:", message);
            this.isStreaming = true;
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 确保不被代理缓存
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no"
                },
                // 确保使用流式传输
                body: JSON.stringify({
                    user_id: "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471",
                    content: message
                })
            });

            console.log("📡 Response status:", response.status);

            if (!response.body) {
                console.error("No response body received.");
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let jsonStart = buffer.indexOf("{");
                let jsonEnd = buffer.indexOf("}", jsonStart);

                while (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = buffer.slice(jsonStart, jsonEnd + 1);
                    buffer = buffer.slice(jsonEnd + 1);

                    try {
                        const chunkData = JSON.parse(jsonStr);
                        if (chunkData.type === "agent_answer") {
                            // 添加一个小延迟模拟打字效果
                            await new Promise(resolve => setTimeout(resolve, 30));
                            EventBus.emit("chat-stream", {
                                chunk: chunkData.content,
                                isComplete: false
                            });
                        }
                    } catch (error) {
                        console.error("JSON Parse Error:", error, "Data:", jsonStr);
                    }

                    jsonStart = buffer.indexOf("{");
                    jsonEnd = buffer.indexOf("}", jsonStart);

                    if (jsonEnd === -1) break;
                }
            }

            // Send completion event
            EventBus.emit("chat-stream", {
                chunk: "",  // No need to send content in completion event
                isComplete: true
            });

        } catch (error) {
            console.error("❌ AI回复失败:", error);
            EventBus.emit("chat-loading", false);
        } finally {
            this.isStreaming = false;
        }
    }
}

export default AIChatClient.getInstance(); 