"use client";

import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2Icon } from "lucide-react";

export function WalletGate({
  handleReadAuthorization,
  isLoading
}: {
  handleReadAuthorization: () => void;
  isLoading: boolean;
}) {
  const { connected } = useWallet();

  return (
    <Card className="bg-white dark:bg-zinc-900 max-w-md mx-auto rounded-3xl shadow-xl border border-muted p-8 text-center flex flex-col justify-between">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-black dark:text-white">Verify Your Wallet</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Holders of the{" "}
          <span className="font-medium text-black dark:text-white">Gorecats Cover NFT</span>{" "}
          can unlock full access.
        </p>
      </div>

      <CardContent className="pt-4">
        {connected ? (
          <Button
            onClick={handleReadAuthorization}
            className="w-full h-11 flex items-center justify-center gap-2 text-base"
            disabled={isLoading}
          >
            {isLoading && <Loader2Icon className="w-4 h-4 animate-spin" />}
            Authenticate & Read
          </Button>
        ) : (
          <ConnectWalletButton className="w-full h-11 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition" />
        )}
      </CardContent>
    </Card>
  );
}
