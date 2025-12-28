"use client";

import { ClipboardDocumentCheckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { PermitV2 } from "~~/permits/permitV2";

export const PermitCopyDataButton: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const onCopyPermitData = () => {
    setCopied(true);
    copyToClipboard(permit.export());
  };

  return (
    <button className="btn btn-secondary" onClick={onCopyPermitData}>
      {copied ? "Copied " : "Copy Permit Data "}
      {copied && <ClipboardDocumentCheckIcon className="w-4 h-4" />}
      {!copied && <ClipboardDocumentListIcon className="w-4 h-4" />}
    </button>
  );
};
