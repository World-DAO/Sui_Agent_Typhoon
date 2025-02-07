import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export function wagmi({children}: {children: ReactNode}) {
  const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
      [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    },
  })
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}