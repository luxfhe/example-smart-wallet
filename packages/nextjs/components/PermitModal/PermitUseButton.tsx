"use client";

import { useAccount } from "@account-kit/react";
import { useLuxFHEActivePermitHash } from "~~/permits/hooks";
import { PermitV2 } from "~~/permits/permitV2";
import { setActivePermitHash } from "~~/permits/store";

export const PermitUseButton: React.FC<{ permit: PermitV2; className?: string }> = ({ permit, className }) => {
  const { address } = useAccount({ type: "LightAccount" });
  const activePermitHash = useLuxFHEActivePermitHash();
  const hash = permit.getHash();

  const isAlreadyInUse = hash == activePermitHash;
  const isUsable = permit.type === "self" || permit.type === "recipient";
  const disabled = isAlreadyInUse || !isUsable;

  const onUsePermit = () => {
    if (hash == activePermitHash) return;
    if (address == null) return;
    setActivePermitHash(address, permit.getHash());
  };

  return (
    <button className={`btn btn-primary ${className}`} disabled={disabled} onClick={onUsePermit}>
      {(!disabled || !isUsable) && "Use"}
      {isAlreadyInUse && "Already Active Permit"}
    </button>
  );
};
