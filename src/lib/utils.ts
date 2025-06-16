import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// RPC Node Endpoint
export const endpoint = (process.env.SOLANA_RPC_NODE_ENDPOINT as string) || clusterApiUrl('devnet')
export const network = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet


