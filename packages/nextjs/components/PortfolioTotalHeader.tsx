"use client";

import { processUnsealables } from "~~/utils/fhenix/unsealable";
import { UnsealableDisplay } from "~~/components/fhenix/UnsealableDisplay";
import { usePortfolioSummaryData } from "~~/services/store/tokensStore";

export const PortfolioTotalHeader = () => {
  const { totalValue } = usePortfolioSummaryData();
  const totalValueDisplay = processUnsealables([totalValue], totalVal => `$${totalVal.toFixed(2)}`);
  return (
    <div className="flex flex-col justify-start items-start">
      <div className="text-2xl font-bold">Portfolio Total</div>
      <UnsealableDisplay item={totalValueDisplay} className="text-[60px] font-normal" sealedLength={8} />
      <div className="text-xl text-secondary-content">+1.3% ($10.00)</div>
    </div>
  );
};
