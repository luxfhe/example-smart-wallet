"use client";

import React from "react";
import { useLuxFHEPermitWithHash } from "~~/permits/hooks";
import { usePermitModalFocusedPermitHash } from "~~/services/store/permitModalStore";
import {
  PermitAccessDisplayRow,
  PermitExpirationDisplayRow,
  PermitIssuerSignatureDisplayRow,
  PermitNameEditableDisplayRow,
  PermitIssuerDisplayRow,
  PermitRecipientDisplayRow,
  PermitRecipientSignatureDisplayRow,
  PermitTypeDisplayRow,
} from "./DisplayRows";
import { PermitCopyDataButton } from "./PermitCopyDataButton";
import { PermitUseButton } from "./PermitUseButton";
import { useAccount } from "@account-kit/react";
import { PermitV2 } from "~~/permits/permitV2";
import { updatePermitName } from "~~/permits/store";
import { PermitDeleteButton } from "./PermitDeleteButton";

const NameRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const { address } = useAccount({ type: "LightAccount" });

  return (
    <PermitNameEditableDisplayRow
      name={permit.name}
      onUpdateName={(value: string) => updatePermitName(address, permit.getHash(), value)}
    />
  );
};

export const PermitV2ModalDetails = () => {
  const { focusedPermitHash } = usePermitModalFocusedPermitHash();
  const permit = useLuxFHEPermitWithHash(focusedPermitHash);

  if (permit == null) {
    return <div>PERMIT NOT FOUND</div>;
  }

  return (
    <>
      <NameRow permit={permit} />
      <PermitTypeDisplayRow permit={permit} />
      <PermitIssuerDisplayRow permit={permit} />
      <PermitRecipientDisplayRow permit={permit} />
      <PermitExpirationDisplayRow permit={permit} />
      <PermitAccessDisplayRow permit={permit} />
      <PermitIssuerSignatureDisplayRow permit={permit} />
      <PermitRecipientSignatureDisplayRow permit={permit} />

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <PermitDeleteButton permit={permit} />
        <PermitCopyDataButton permit={permit} />
        <PermitUseButton permit={permit} className="flex-[1]" />
      </div>
    </>
  );
};
