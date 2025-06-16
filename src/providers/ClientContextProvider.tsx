'use client'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { createContext, useContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWalletAdapter } from '@/lib/useWalletAdapter'
import { endpoint } from '@/lib/utils'

export const ClientContext = createContext(null)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 10 * 1000, // stale for 10 seconds
    },
  },
})

const ClientContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const wallets = useWalletAdapter()

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
            <WalletModalProvider className='wallet-dialog'>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  )
}

export default ClientContextProvider

export const useClientContext = (): null => useContext(ClientContext)
