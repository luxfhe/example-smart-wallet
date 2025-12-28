/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { processUnsealables } from "~~/utils/luxfhe/unsealable";
import { useDerivedTokens, DerivedTokenData, useTokensStore } from "~~/services/store/tokensStore";
import { bigintFixed } from "~~/utils/scaffold-eth/bigint";
import { UnsealableDisplay } from "./luxfhe/UnsealableDisplay";

const modalId = "token-select-modal";

const TokenRow: React.FC<{
  token: DerivedTokenData;
  onSelect: (tokenAddress: string) => void;
}> = ({ token, onSelect }) => {
  const encBalDisplay = processUnsealables([token.encBalance], encBal => bigintFixed(encBal, token.decimals, 4));
  const totalBalDisplay = processUnsealables([token.totalBalance], totalBal =>
    bigintFixed(totalBal, token.decimals, 4),
  );
  const totalValDisplay = processUnsealables([token.totalValue], totalVal => `($${totalVal.toFixed(2)})`);

  return (
    <tr
      className="hover:bg-slate-200 hover:bg-opacity-10 cursor-pointer bg-opacity-10 rounded-md transition-all"
      onClick={() => {
        onSelect(token.address);
        const modalIdCheckbox = document?.querySelector(`#${modalId}`);
        if (modalIdCheckbox != null) (modalIdCheckbox as HTMLInputElement).checked = false;
      }}
    >
      <th>{token.symbol}</th>
      <td className="text-center">
        <UnsealableDisplay item={encBalDisplay} className="font-bold text-highlight" />
      </td>
      <td className="text-center">
        <span className="font-bold">{bigintFixed(token.balance, token.decimals, 4)}</span>
      </td>
      <td className="flex flex-row justify-end">
        <div className="flex flex-col items-end w-min">
          <UnsealableDisplay item={totalBalDisplay} className="font-bold" />
          <UnsealableDisplay item={totalValDisplay} className="text-xs" />
        </div>
      </td>
    </tr>
  );
};

const SortedTokens: React.FC<{ onSelect: (tokenAddress: string) => void }> = ({ onSelect }) => {
  const derivedFherc20s = useDerivedTokens();

  if (derivedFherc20s == null || derivedFherc20s.length === 0)
    return (
      <tr>
        <th>loading....</th>
      </tr>
    );

  return (
    <>
      {derivedFherc20s
        .sort((a, b) =>
          (b.totalValue?.data ?? b.visValue ?? 0) - (a.totalValue?.data ?? a.visValue ?? 0) > 0 ? 1 : -1,
        )
        .map(fherc20 => {
          return <TokenRow key={fherc20.address} token={fherc20} onSelect={onSelect} />;
        })}
    </>
  );
};

export const TokenSelectModal: React.FC<{ onSelect: (tokenAddress: string) => void }> = ({ onSelect }) => {
  return (
    <>
      <div>
        <input type="checkbox" id={modalId} className="modal-toggle" />
        <label htmlFor={modalId} className="modal cursor-pointer">
          <label className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>
            <div className="gap-4 py-4">
              <div>Select Token</div>
              <div>Input here</div>
              <table className="table">
                <thead>
                  <tr className="border-b-base-content">
                    <th>Token</th>
                    <th>
                      <div className="flex flex-row gap-4 items-center justify-center text-highlight">
                        <EyeSlashIcon className="w-4 h-4" />
                        BAL
                      </div>
                    </th>
                    <th>
                      <div className="flex flex-row gap-4 items-center justify-center ">
                        <EyeIcon className="w-4 h-4" />
                        BAL
                      </div>
                    </th>
                    <th className="flex justify-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <SortedTokens onSelect={onSelect} />
                </tbody>
              </table>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
