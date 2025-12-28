"use client";

import { useAccount, useChain } from "@account-kit/react";
import { useState } from "react";
import { PermitV2 } from "~~/permits/permitV2";
import { setActivePermitHash, setPermit } from "~~/permits/store";
import { AbstractSigner } from "~~/permits/types";
import { usePermitModalFocusedPermitHash, usePermitModalImporting } from "~~/services/store/permitModalStore";
import { notification } from "~~/utils/scaffold-eth";

export const PermitImportButton: React.FC<{ permit: PermitV2; className?: string }> = ({
  permit: importingPermit,
  className,
}) => {
  const { chain } = useChain();
  const { account } = useAccount({ type: "LightAccount" });
  const [importing, setImporting] = useState(false);
  const { setImportingPermit } = usePermitModalImporting();
  const { setFocusedPermitHash } = usePermitModalFocusedPermitHash();

  const onSignAndImport = async () => {
    if (account == null || chain == null || importingPermit == null) return;

    setImporting(true);

    const abstractSigner: AbstractSigner = {
      getAddress: async () => account.address,
      // Should probably add the primaryType to this in the abstract signer to make it easier to interact with via viem
      signTypedData: (domain, types, primaryType, value: Record<string, unknown>) =>
        account.signTypedData({ domain, types, primaryType, message: value }),
    };

    await importingPermit.sign(chain.id.toString(), abstractSigner);

    setPermit(account.address, importingPermit);
    setActivePermitHash(account.address, importingPermit.getHash());
    setImportingPermit(undefined);
    notification.success("Permit Imported Successfully");
    setFocusedPermitHash(importingPermit.getHash());

    setImporting(false);
  };

  return (
    <button className={`btn btn-primary ${className}`} onClick={onSignAndImport}>
      {importing ? "Importing" : "Sign and Import"}
      {importing && <span className="loading loading-spinner loading-sm"></span>}
    </button>
  );
};
