/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { TokenData } from "~~/services/store/tokensStore";

export const TokenSelectRow: React.FC<{
  token: TokenData | undefined;
  amount: string;
  setAmount: (amount: string) => void;
}> = ({ token, amount, setAmount }) => {
  return (
    <div className="flex flex-row w-full items-center justify-center bg-base-300 bg-opacity-30 rounded-sm">
      <label htmlFor="token-select-modal" className="btn flex gap-3 py-3 items-center justify-center">
        <span className={token == null ? "font-normal" : "font-bold"}>{token?.symbol ?? "SELECT"}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </label>
      <div className="flex flex-row flex-1 justify-between items-center">
        <div className="flex flex-1 justify-end px-4 text-right w-full">{amount ?? "0"}</div>
      </div>
    </div>
  );
};
