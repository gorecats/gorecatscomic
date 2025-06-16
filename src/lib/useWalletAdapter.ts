import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'
import { network } from './utils'

type WalletAdapterHook = () => (PhantomWalletAdapter | SolflareWalletAdapter )[]

export const useWalletAdapter: WalletAdapterHook = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return []
    else
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
      ]
  }, [])
}

