'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'

export const ClientContext = createContext(null)
export const useClientContext = (): null => useContext(ClientContext)

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

export const ReactQueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}