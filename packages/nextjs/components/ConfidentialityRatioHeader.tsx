"use client";

import { processUnsealables } from "~~/utils/luxfhe/unsealable";
import { UnsealableDisplay } from "~~/components/luxfhe/UnsealableDisplay";
import { usePortfolioSummaryData } from "~~/services/store/tokensStore";

export const ConfidentialityRatioHeader = () => {
  const { visValue, encValue, encPerc } = usePortfolioSummaryData();
  const encRowDisplay = processUnsealables(
    [encPerc, encValue],
    (perc, val) => `${perc.toFixed(2)}% ($${val.toFixed(0)})`,
  );

  const visRowDisplay = processUnsealables(
    [encPerc, visValue],
    (perc, val) => `($${val.toFixed(0)}) ${perc.toFixed(2)}%`,
  );

  return (
    <div className="flex flex-col justify-between items-end gap-4">
      <div className="text-2xl font-bold">Confidentiality Ratio</div>
      <div className="flex flex-row w-full justify-between items-start">
        <div className="flex flex-col justify-start items-start">
          <div className="text-highlight">Confidential</div>
          <UnsealableDisplay item={encRowDisplay} className="text-highlight" />
        </div>
        <div className="flex flex-col justify-start items-end">
          <div className="text-secondary-content">Public</div>
          <UnsealableDisplay item={visRowDisplay} className="text-secondary-content" />
        </div>
      </div>
      <div className="relative w-full h-6 border-2 border-neutral-content bg-neutral-content rounded-md">
        <div
          className="absolute h-full left-0 bg-highlight rounded-md"
          style={{ width: `${Math.max(1, encPerc?.data ?? 0)}%` }}
        />
      </div>
    </div>
  );
};
