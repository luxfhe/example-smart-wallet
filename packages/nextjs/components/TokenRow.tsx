"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { processUnsealables, Unsealable } from "~~/utils/fhenix/unsealable";
import React from "react";
import { UnsealableDisplay, UnsealablesDisplay } from "~~/components/fhenix/UnsealableDisplay";
import { DerivedTokenData } from "~~/services/store/tokensStore";
import { bigintFixed } from "~~/utils/scaffold-eth/bigint";
import { MockTokenMintModal } from "./MockTokenMintModal";

export const TokenRow: React.FC<{
  token: DerivedTokenData;
  portfolioValue: Unsealable<number> | undefined;
}> = ({ token, portfolioValue }) => {
  const shareOfPortfolio = processUnsealables([token.totalValue, portfolioValue], (totalVal, portfolioVal) => {
    if (portfolioVal === 0) return 0;
    return (totalVal * 100) / portfolioVal;
  });

  const totalBalanceDisplay = processUnsealables([token.totalBalance], totalBal => {
    return bigintFixed(totalBal, token.decimals, 4);
  });

  const totalValueDisplay = processUnsealables([token.totalValue], totalVal => `$${totalVal.toFixed(2)}`);

  const encBalanceDisplay = processUnsealables([token.encBalance], encBal => bigintFixed(encBal, token.decimals, 4));
  const visBalanceDisplay = processUnsealables([token.balance], visBal => bigintFixed(visBal, token.decimals, 4));

  const shareOfPortfolioDisplay = processUnsealables([shareOfPortfolio], share => `${share.toFixed(2)}%`);

  return (
    <tr className="bg-opacity-10">
      <th>{token.symbol}</th>
      <td>
        <div className="flex flex-col items-start">
          <UnsealableDisplay item={totalBalanceDisplay} className="font-bold" sealedLength={5} />
          <UnsealableDisplay item={totalValueDisplay} className="text-xs" sealedLength={5} />
        </div>
      </td>
      <td>
        <div className="flex flex-col">
          <div className="flex flex-row w-full justify-between font-bold">
            <div className="flex flex-row align-center items-center gap-2 text-highlight">
              <EyeSlashIcon className="w-4 h-4" />
              <UnsealableDisplay item={encBalanceDisplay} />
            </div>
            <div className="flex flex-row align-center items-center gap-2 text-secondary-content">
              <UnsealableDisplay item={visBalanceDisplay} />
              <EyeIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-row w-full justify-between text-xs">
            <span className="text-highlight">
              <UnsealablesDisplay items={[token.encPerc]} fn={encPerc => `${encPerc.toFixed(2)}%`} />{" "}
              <UnsealablesDisplay items={[token.encValue]} fn={encVal => `($${encVal.toFixed(2)})`} />
            </span>
            <span className="text-secondary-content">
              <UnsealablesDisplay items={[token.visValue]} fn={visVal => `($${visVal.toFixed(2)})`} />{" "}
              <UnsealablesDisplay items={[token.encPerc]} fn={encPerc => `${encPerc.toFixed(2)}%`} />
            </span>
          </div>
          <div className="relative w-full h-1 mt-1 bg-neutral-content rounded-md">
            <div
              className="absolute h-full left-0 bg-highlight rounded-md"
              style={{ width: `${Math.max(1, token.encPerc?.data ?? 0).toFixed(2)}%` }}
            />
          </div>
        </div>
      </td>
      <td>
        <UnsealableDisplay item={shareOfPortfolioDisplay} className="font-bold" />
      </td>
      <td>
        <div className="flex flex-col items-center w-min">
          <span className="font-bold text-secondary-content">${token.price?.toFixed(2)}</span>
        </div>
      </td>
      <td>
        <MockTokenMintModal token={token} />
      </td>
    </tr>
  );
};
