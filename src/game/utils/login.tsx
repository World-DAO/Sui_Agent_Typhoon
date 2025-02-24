"use client";

import { useEffect, useState } from "react";
import { EventBus } from "../EventBus";
import { useGet } from "@/hooks/useGet";
import { WalletModal } from "@/components/WalletModal";
import { useCurrentWallet } from "@mysten/dapp-kit";
import ColyseusClient from "@/game/utils/ColyseusClient";
import { getSuiBalance } from "./sui";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentWallet } = useCurrentWallet();

  useEffect(() => {
    const loginHandler = async () => {
      try {
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to open wallet selector:", error);
      }
    };

    EventBus.on("phaser_loginRequest", loginHandler);

    return () => {
      EventBus.removeListener("phaser_loginRequest", loginHandler);
    };
  }, []);

  const handleGameStart = async () => {
    if (!currentWallet || !currentWallet.accounts.length) {
      console.error("❌ Wallet not connected!");
      alert("Please connect your wallet first!");
      return;
    }

    const address = currentWallet.accounts[0].address;
    console.log("🎮 Connecting to Colyseus, wallet address:", address);

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

        setTimeout(() => reject(new Error("⏳ Challenge timeout")), 5000);
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

      // ✅ Send valid signature
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
        const suiBalance = await getSuiBalance(address);
        EventBus.emit("phaser_loginResponse", {
          success: true,
          data: {
            suiBalance: suiBalance,
            walletName: currentWallet.name,
            walletAddress: address,
            token: loginResponse.token, // JWT Token
          },
        });

        setIsModalOpen(false); // Close wallet selection modal
      } else {
        console.error("❌ Login failed:", loginResponse.reason);
      }
    } catch (error) {
      console.error("❌ Failed to enter game:", error);
    }
  };

  return (
    <>
      {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} onGameStart={handleGameStart} />}
    </>
  );
}