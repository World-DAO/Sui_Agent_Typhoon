import React, { useState } from "react";
import {
    useConnectWallet,
    useWallets,
    useCurrentWallet,
    useDisconnectWallet,
} from "@mysten/dapp-kit";

// 定义 Props 类型
interface WalletModalProps {
    onClose: () => void;
    onGameStart: () => void;
}

export function WalletModal({ onClose, onGameStart }: WalletModalProps) {
    // 钱包列表
    const wallets = useWallets();
    const { mutate: connect } = useConnectWallet();
    const { mutate: disconnect } = useDisconnectWallet();
    const { currentWallet } = useCurrentWallet();
    const [error, setError] = useState<string>("");

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.85)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                backdropFilter: "blur(10px)",
            }}
        >
            <div
                style={{
                    background: "rgba(20, 20, 20, 0.95)",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 0 10px rgba(0, 255, 255, 0.7)",
                    textAlign: "center",
                    width: "400px",
                    border: "2px solid rgba(0, 255, 255, 0.5)",
                }}
            >
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        marginBottom: "15px",
                        color: "#0ff",
                        textShadow: "0 0 10px #0ff",
                    }}
                >
                    🔮 选择钱包
                </h2>

                {/* 钱包列表 */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {wallets.length > 0 ? (
                        wallets.map((wallet) => {
                            const isConnected = currentWallet && currentWallet.name === wallet.name;

                            return (
                                <li key={wallet.name} style={{ marginBottom: "10px" }}>
                                    <button
                                        onClick={() => {
                                            if (isConnected) {
                                                disconnect();
                                                return;
                                            }
                                            if (!wallet?.name) {
                                                setError("未找到可用的钱包，请安装 Sui Wallet");
                                                return;
                                            }
                                            connect(
                                                { wallet }, // 💡 确保 wallet 传递正确的类型
                                                {
                                                    onSuccess: () => console.log(`✅ 连接成功: ${wallet.name}`),
                                                    onError: (err: Error) => setError(err.message),
                                                }
                                            );
                                        }}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: isConnected ? "2px solid #0f0" : "2px solid #ff0090",
                                            backgroundColor: isConnected ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 144, 0.2)",
                                            color: isConnected ? "#0f0" : "#ff0090",
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                            textShadow: isConnected ? "0 0 5px #0f0" : "0 0 5px #ff0090",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        {isConnected
                                            ? `✅ ${currentWallet?.accounts?.[0]?.address.slice(0, 6)}...`
                                            : `连接 ${wallet.name}`}
                                    </button>

                                    {/* 断开连接按钮 */}
                                    {isConnected && (
                                        <button
                                            onClick={() => disconnect()}
                                            style={{
                                                marginTop: "5px",
                                                width: "100%",
                                                padding: "8px",
                                                border: "2px solid #ff4500",
                                                backgroundColor: "rgba(255, 69, 0, 0.2)",
                                                color: "#ff4500",
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                borderRadius: "5px",
                                                textShadow: "0 0 5px #ff4500",
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            ❌ 断开连接
                                        </button>
                                    )}
                                </li>
                            );
                        })
                    ) : (
                        <p
                            style={{
                                color: "#ff0090",
                                fontSize: "14px",
                                marginTop: "10px",
                                textShadow: "0 0 5px #ff0090",
                            }}
                        >
                            ❌ 未检测到可用钱包，请安装 Sui Wallet
                        </p>
                    )}
                </ul>

                {/* 进入游戏按钮 */}
                <button
                    onClick={() => {
                        if (currentWallet) {
                            onGameStart(); // ✅ 触发外部的游戏启动事件
                            onClose(); // 关闭弹窗
                        }
                    }}
                    disabled={!currentWallet}
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        padding: "12px",
                        backgroundColor: currentWallet ? "rgba(0, 255, 255, 0.5)" : "rgba(128, 128, 128, 0.5)",
                        color: currentWallet ? "#0ff" : "#888",
                        border: "2px solid #0ff",
                        borderRadius: "5px",
                        cursor: currentWallet ? "pointer" : "not-allowed",
                        fontSize: "16px",
                        fontWeight: "bold",
                        textShadow: "0 0 8px #0ff",
                        transition: "all 0.3s ease",
                    }}
                >
                    🎮 进入游戏
                </button>
            </div>
        </div>
    );
}