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
  isLoading: boolean
}) {
  const { connected } = useWallet();
  
  return (
    <Card className="max-w-md mx-auto rounded-2xl shadow-md border border-muted p-6 bg-background text-center space-y-4">
      <h2 className="text-xl font-semibold">Verify Your Wallet</h2>
      <p className="text-sm text-muted-foreground">
        Holders of the{" "}
        <span className="font-medium text-foreground">Gorecats Cover NFT</span>{" "}
        can unlock full access.
      </p>
      <CardContent>
        {connected ? (
          <Button onClick={handleReadAuthorization} className="w-full">
            {isLoading ? <Loader2Icon /> : "Authenticate & Read"}
          </Button>
        ) : (
          <ConnectWalletButton />
        )}
      </CardContent>
    </Card>
  );
}
