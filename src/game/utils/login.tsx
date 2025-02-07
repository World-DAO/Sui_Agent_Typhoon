"use client";

import { useEffect, useState } from "react";
import { EventBus } from "../EventBus";
import { useGet } from "@/hooks/useGet";
import { WalletModal } from "@/components/WalletModal";
import { useCurrentWallet } from "@mysten/dapp-kit";
import ColyseusClient from "@/game/utils/ColyseusClient";

type TestResponse = {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    username: string;
    lastLoginTime: string;
  };
};

export function ReactPhaserBridge() {
  const { data: userData, mutate: refreshUserData } = useGet<TestResponse>("/api/test?userId=1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentWallet } = useCurrentWallet();

  useEffect(() => {
    const loginHandler = async () => {
      try {
        setIsModalOpen(true);
      } catch (error) {
        console.error("打开钱包选择失败:", error);
      }
    };

    EventBus.on("phaser_loginRequest", loginHandler);

    return () => {
      EventBus.removeListener("phaser_loginRequest", loginHandler);
    };
  }, []);

  const handleGameStart = async () => {
    if (!currentWallet || !currentWallet.accounts.length) {
      console.error("❌ 钱包未连接！");
      alert("请先连接钱包！");
      return;
    }

    const address = currentWallet.accounts[0].address;
    console.log("🎮 连接 Colyseus，钱包地址:", address);

    try {
      const room = await ColyseusClient.joinRoom(address);
      ColyseusClient.sendMessage("userLogin", { address });

      const loginChallenge = await new Promise<{ challenge: string }>((resolve, reject) => {
        room.onMessage("loginChallenge", (data) => {
          if (data.challenge) {
            resolve(data);
          } else {
            reject(new Error("No challenge received"));
          }
        });

        setTimeout(() => reject(new Error("⏳ Challenge out of time")), 5000);
      });

      console.log("Challenge:", loginChallenge.challenge);

      if (!currentWallet.features["sui:signPersonalMessage"]) {
        console.log("features:", currentWallet.features);
        return;
      }
      const signedData = await currentWallet.features["sui:signPersonalMessage"].signPersonalMessage({
        account: currentWallet.accounts[0],
        message: new TextEncoder().encode(loginChallenge.challenge),
      });

      console.log("signature:", signedData.signature);

      // ✅ 发送正确的签名
      ColyseusClient.sendMessage("loginSignature", {
        address,
        signature: signedData.signature,
        challenge: loginChallenge.challenge,
      });
      const loginResponse = await new Promise<{ success: boolean; token?: string; reason?: string }>((resolve, reject) => {
        room.onMessage("loginResponse", (data) => {
          resolve(data);
        });

        setTimeout(() => reject(new Error("loginResponse timeout")), 5000);
      });

      console.log("loginResponse:", loginResponse);

      if (loginResponse.success) {
        EventBus.emit("phaser_loginResponse", {
          success: true,
          data: {
            walletName: currentWallet.name,
            walletAddress: address,
            token: loginResponse.token, // JWT Token
          },
        });

        setIsModalOpen(false); // 关闭钱包选择弹窗
      } else {
        console.error("❌ 登录失败:", loginResponse.reason);
      }
    } catch (error) {
      console.error("❌ 进入游戏失败:", error);
    }
  };

  return (
    <>
      {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} onGameStart={handleGameStart} />}
    </>
  );
}