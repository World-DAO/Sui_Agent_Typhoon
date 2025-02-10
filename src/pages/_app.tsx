import { networkConfig } from "@/components/config/networkConfig";
import { WalletProvider } from "@mysten/dapp-kit";
import { SuiClientProvider } from "@mysten/dapp-kit";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

// 创建全局的 QueryClient 实例
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider autoConnect>
          {/* 如果有其他 Provider 需要放在这里 */}
          <Component {...pageProps} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
