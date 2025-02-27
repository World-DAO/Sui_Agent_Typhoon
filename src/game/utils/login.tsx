"use client";

import { useEffect, useState } from "react";
import { EventBus } from "../EventBus";
import { WalletModal } from "@/components/WalletModal";
import { useCurrentWallet, useSignPersonalMessage } from "@mysten/dapp-kit";
import ColyseusClient from "@/game/utils/ColyseusClient";
import { getSuiBalance } from "./sui";

export function ReactPhaserBridge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentWallet } = useCurrentWallet();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

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

      const challenge = loginChallenge.challenge;
      console.log("Challenge:", challenge);

      const signature = await new Promise<string>((resolve, reject) => {
        signPersonalMessage(
          { message: new TextEncoder().encode(challenge) },
          { onSuccess: (result) => resolve(result.signature), onError: (error) => reject(error) }
        );
      });

      console.log("signature:", signature);

      ColyseusClient.sendMessage("loginSignature", {
        address,
        signature: signature,
        challenge: challenge,
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
            token: loginResponse.token,
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