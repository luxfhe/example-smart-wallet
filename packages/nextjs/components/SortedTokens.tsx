"use client";

import { usePortfolioSummaryData, useDerivedTokens } from "~~/services/store/tokensStore";
import { TokenRow } from "./TokenRow";

export const SortedTokens = () => {
  const { totalValue: portfolioValue } = usePortfolioSummaryData();
  const derivedFherc20s = useDerivedTokens();

  if (derivedFherc20s == null || derivedFherc20s.length === 0)
    return (
      <tr>
        <th colSpan={6}>
          <div className="w-full flex flex-col gap-8 items-center justify-center my-32">
            Loading FHERC20 Tokens...
            <span className="loading loading-spinner loading-xs"></span>
          </div>
        </th>
      </tr>
    );
  return (
    <>
      {derivedFherc20s
        .sort((a, b) =>
          (b.totalValue?.data ?? b.visValue ?? 0) - (a.totalValue?.data ?? b.visValue ?? 0) > 0 ? 1 : -1,
        )
        .map(fherc20 => {
          return <TokenRow key={fherc20.address} token={fherc20} portfolioValue={portfolioValue} />;
        })}
    </>
  );
};
