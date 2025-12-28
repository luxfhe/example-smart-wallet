"use client";

import { useUser } from "@account-kit/react";
import { WalletIcon } from "@heroicons/react/24/outline";
import { usePermitModalOpen } from "~~/services/store/permitModalStore";
import { PermitV2StatusIndicator } from "../PermitModal/StatusIndicator";

export const PermitModalButton = () => {
  const user = useUser();
  const { setOpen } = usePermitModalOpen();

  if (user == null) return null;

  return (
    <button className="btn aspect-square p-0" onClick={() => setOpen(true)}>
      <div className="relative w-[32px] h-[32px] flex items-center justify-center rounded-full bg-highlight">
        <WalletIcon className="h-4 w-4 text-white" />
        <div className="absolute w-4 h-4 -top-1 -right-1 rounded-full bg-base-200 flex items-center justify-center">
          <PermitV2StatusIndicator />
        </div>
      </div>
    </button>
  );
};
