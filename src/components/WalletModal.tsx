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
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/85 backdrop-blur-[10px]">
            <div className="w-[400px] bg-[rgba(20,20,20,0.95)] p-[30px] rounded-xl shadow-[0_0_10px_rgba(0,255,255,0.7)] 
                          text-center border-2 border-[rgba(0,255,255,0.5)]">
                <h2 className="text-[22px] font-bold mb-[15px] text-[#0ff]">
                    🔮 Select Wallet
                </h2>

                {/* Wallet List */}
                <ul className="list-none p-0 m-0">
                    {wallets.length > 0 ? (
                        wallets.map((wallet) => {
                            const isConnected = currentWallet && currentWallet.name === wallet.name;

                            return (
                                <li key={wallet.name} className="mb-[10px]">
                                    <button
                                        onClick={() => {
                                            if (isConnected) {
                                                disconnect();
                                                return;
                                            }
                                            if (!wallet?.name) {
                                                setError("No wallet found. Please install Sui Wallet");
                                                return;
                                            }
                                            connect(
                                                { wallet },
                                                {
                                                    onSuccess: () => console.log(`✅ Connected: ${wallet.name}`),
                                                    onError: (err: Error) => setError(err.message),
                                                }
                                            );
                                        }}
                                        className={`w-full p-[10px] text-[14px] font-bold rounded cursor-pointer transition-all duration-300
                                                  ${isConnected 
                                                    ? 'border-2 border-[#0f0] bg-[rgba(0,255,0,0.2)] text-[#0f0] shadow-[0_0_5px_#0f0]'
                                                    : 'border-2 border-[#ff0090] bg-[rgba(255,0,144,0.2)] text-[#ff0090] shadow-[0_0_5px_#ff0090]'
                                                  }`}
                                    >
                                        {isConnected
                                            ? `✅ ${currentWallet?.accounts?.[0]?.address.slice(0, 6)}...`
                                            : `Connect ${wallet.name}`}
                                    </button>

                                    {/* Disconnect button */}
                                    {isConnected && (
                                        <button
                                            onClick={() => disconnect()}
                                            className="w-full mt-[5px] p-[8px] text-[14px] font-bold rounded cursor-pointer
                                                     border-2 border-[#ff4500] bg-[rgba(255,69,0,0.2)] text-[#ff4500]
                                                     shadow-[0_0_5px_#ff4500] transition-all duration-300"
                                        >
                                            ❌ Disconnect
                                        </button>
                                    )}
                                </li>
                            );
                        })
                    ) : (
                        <p className="text-[#ff0090] text-[14px] mt-[10px] shadow-[0_0_5px_#ff0090]">
                            ❌ No wallet detected. Please install Sui Wallet
                        </p>
                    )}
                </ul>

                {/* Enter Game button */}
                <button
                    onClick={() => {
                        if (currentWallet) {
                            onGameStart();
                            onClose();
                        }
                    }}
                    disabled={!currentWallet}
                    className={`w-full mt-[20px] p-[12px] text-[16px] font-bold rounded transition-all duration-300
                              border-2 border-[#0ff] 
                              ${currentWallet 
                                ? 'bg-[rgba(0,255,255,0.5)] text-[#0ff] cursor-pointer shadow-[0_0_8px_#0ff]'
                                : 'bg-[rgba(128,128,128,0.5)] text-[#888] cursor-not-allowed'
                              }`}
                >
                    🎮 Enter Game
                </button>
            </div>
        </div>
    );
}