"use client";

import { useAccount } from "@account-kit/react";
import React from "react";
import { useState } from "react";
import { PermitV2 } from "~~/permits/permitV2";
import { PermitV2Options } from "~~/permits/types";
import { usePermitModalImporting, usePermitModalUpdateImportingPermitName } from "~~/services/store/permitModalStore";
import { TextArea } from "../scaffold-eth/Input/TextArea";
// import { stringToJSyON } from "./utils";
import { PermitV2ParamsValidator } from "~~/permits/permitV2.z";
import {
  PermitTypeDisplayRow,
  PermitNameEditableDisplayRow,
  PermitRecipientDisplayRow,
  PermitExpirationDisplayRow,
  PermitAccessDisplayRow,
  ValidityIndicator,
} from "./DisplayRows";
import { PermitImportButton } from "./PermitImportButton";

const PermitV2ModalImportEntry = () => {
  const { address } = useAccount({ type: "LightAccount" });
  const { setImportingPermit } = usePermitModalImporting();
  const [imported, setImported] = useState("");
  const [error, setError] = useState("");

  const importPermitData = async (value: string) => {
    setImported(value);

    let parsedData: object = {};
    try {
      parsedData = JSON.parse(value);
    } catch (e) {
      console.log({ e });
      setError(`Json Parsing Failed: ${e}`);
      return;
    }

    const { success, data: parsedPermit, error: permitParsingError } = PermitV2ParamsValidator.safeParse(parsedData);
    if (!success) {
      const errorString = Object.entries(permitParsingError.flatten().fieldErrors)
        .map(([field, err]) => `- ${field}: ${err}`)
        .join("\n");
      console.log({ permitParsingError });
      setError(`Invalid Permit Data:\n${errorString}`);
      return;
    }
    if (parsedPermit.type !== "self") {
      if (parsedPermit.issuer === address) parsedPermit.type = "sharing";
      else if (parsedPermit.recipient === address) parsedPermit.type = "recipient";
      else {
        setError(`Invalid Permit: connected address ${address} is not issuer or recipient`);
        return;
      }
    }
    const permit = await PermitV2.create(parsedPermit as PermitV2Options);
    setImportingPermit(permit);
    setError("");
  };

  return (
    <>
      <div className="text-sm font-bold">Paste the permit data below to import it:</div>
      <div className="text-sm italic">
        Note: mismatched permit data will invalidate the signature and will not fetch on-chain data successfully.
      </div>
      <TextArea
        name="permit-import"
        value={imported}
        placeholder="Paste Permit Data Here"
        onChange={importPermitData}
      />
      {error.length > 0 && (
        <div className="flex flex-col">
          {error.split("\n").map((err, index) => (
            <span key={index} className="italic text-sm text-error">
              {err}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

const PermitImportClearButton = () => {
  const { setImportingPermit } = usePermitModalImporting();

  return (
    <button className="btn btn-secondary" onClick={() => setImportingPermit(undefined)}>
      Clear
    </button>
  );
};

const NameRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const onUpdateName = usePermitModalUpdateImportingPermitName();
  return <PermitNameEditableDisplayRow name={permit.name} onUpdateName={onUpdateName} />;
};

export const IssuerSignatureRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  if (permit.type !== "recipient") return;

  const validity = permit.issuerSignature !== "0x" ? "success" : "error";

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="text-sm font-bold">{permit.type === "recipient" && "Issuer "}Signature:</div>
      <ValidityIndicator validity={validity} validLabel="Signed by Issuer" invalidLabel="Not Signed By Issuer" />
    </div>
  );
};

const PermitV2ModalImportConfirm = () => {
  const { importingPermit: permit } = usePermitModalImporting();

  if (permit == null) {
    return <div>PERMIT NOT FOUND</div>;
  }

  return (
    <>
      <div className="text-sm italic">Confirm the imported Permit data:</div>

      <NameRow permit={permit} />
      <PermitTypeDisplayRow permit={permit} />
      <PermitRecipientDisplayRow permit={permit} />
      <PermitExpirationDisplayRow permit={permit} />
      <PermitAccessDisplayRow permit={permit} />
      <IssuerSignatureRow permit={permit} />

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <PermitImportClearButton />
        <PermitImportButton permit={permit} className="flex-[1]" />
      </div>
    </>
  );
};

export const PermitV2ModalImport = () => {
  const { importingPermit } = usePermitModalImporting();

  if (importingPermit == null) return <PermitV2ModalImportEntry />;
  return <PermitV2ModalImportConfirm />;
};
