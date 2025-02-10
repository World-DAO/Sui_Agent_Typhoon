import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

// 创建全局的 QueryClient 实例
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 如果有其他 Provider 需要放在这里 */}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
