"use client";

import { useAccount, useAuthModal } from "@account-kit/react";
import { SortedTokens } from "./SortedTokens";

const TokensTableConnectButton = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <tr className="absolute inset-0 -top-10 bg-base-100 bg-opacity-50 pointer-events-auto place-items-center pt-24">
      <th>
        <button onClick={openAuthModal} className="btn btn-primary">
          CONNECT WALLET
        </button>
      </th>
    </tr>
  );
};

const TokensTableBody = () => {
  const { address } = useAccount({ type: "LightAccount" });

  return (
    <tbody className={`relative ${address == null && "pointer-events-none"}`}>
      <SortedTokens />
      {address == null && <TokensTableConnectButton />}
    </tbody>
  );
};

export const PortfolioTokensTable = () => {
  return (
    <table className="table">
      <thead>
        <tr className="border-b-base-content">
          <th>Token</th>
          <th>Balance</th>
          <th>Encrypted Ratio</th>
          <th>Portfolio %</th>
          <th>Price (24h)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <TokensTableBody />
    </table>
  );
};
