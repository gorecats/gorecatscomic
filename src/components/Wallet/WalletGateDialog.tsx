import { Dialog, DialogContent } from "../Dialog";
import React from "react";
import { WalletGate } from "./WalletGate";
import { DialogTitle } from "@radix-ui/react-dialog";

interface Props {
  handleReadAuthorization: VoidFunction;
  isLoading: boolean;
  open: boolean;
  toggleDialog: VoidFunction;
}

export const WalletGateDialog: React.FC<Props> = ({
  handleReadAuthorization,
  open,
  toggleDialog,
  isLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={toggleDialog}>
      <DialogContent className="items-center max-w-fit sm:min-w-fit p-0 bg-transparent xs:min-w-full min-h-[35vh]">
        <WalletGate handleReadAuthorization={handleReadAuthorization} isLoading={isLoading}/>
        <DialogTitle></DialogTitle>
      </DialogContent>
    </Dialog>
  );
};
