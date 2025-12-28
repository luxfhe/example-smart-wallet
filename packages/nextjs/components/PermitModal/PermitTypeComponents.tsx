"use client";

import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { PermitV2 } from "~~/permits/permitV2";

export const PermitTypeIcon: React.FC<{ type: PermitV2["type"] }> = ({ type }) => {
  switch (type) {
    case "self":
      return <ArrowDownTrayIcon className="w-4 h-4" />;
    case "sharing":
      return <ArrowUpTrayIcon className="w-4 h-4 rotate-90" />;
    case "recipient":
      return <ArrowDownTrayIcon className="w-4 h-4 rotate-90" />;
  }
};

export const PermitTypeText: React.FC<{ type: PermitV2["type"] }> = ({ type }) => {
  return (
    <>
      {type === "self" && "Self Usage"}
      {type === "sharing" && "To Share"}
      {type === "recipient" && "Shared with You"}
    </>
  );
};
