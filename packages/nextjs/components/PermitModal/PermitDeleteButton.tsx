"use client";

import { useAccount } from "@account-kit/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { PermitV2 } from "~~/permits/permitV2";
import { removePermit } from "~~/permits/store";
import { PermitV2Tab, usePermitModalTab } from "~~/services/store/permitModalStore";

export const PermitDeleteButton: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const { address } = useAccount({ type: "LightAccount" });
  const { setTab } = usePermitModalTab();
  const [clicked, setClicked] = useState(false);
  const onRemovePermit = () => {
    if (address == null) return;

    // First click
    if (!clicked) {
      setClicked(true);
      return;
    }

    // Second click (confirm)
    removePermit(address, permit.getHash());
    setTab(PermitV2Tab.Select);
  };

  return (
    <button className="btn btn-error" onClick={onRemovePermit}>
      {clicked && "! Confirm"}
      <TrashIcon className="w-4 h-4" />
    </button>
  );
};
