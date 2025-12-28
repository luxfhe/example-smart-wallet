import type { NextPage } from "next";
import { ConfidentialityRatioHeader } from "~~/components/ConfidentialityRatioHeader";
import { ConnectedAccountAndPermitHeader } from "~~/components/ConnectedAccountAndPermitHeader";
import { PortfolioTokensTable } from "~~/components/PortfolioTokensTable";
import { PortfolioTotalHeader } from "~~/components/PortfolioTotalHeader";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col max-w-[975px] gap-12 mx-auto p-8 pt-12 w-full">
      <ConnectedAccountAndPermitHeader />

      {/* <DeployLightAccountButton /> */}
      <div className="flex flex-col gap-6 justify-center items-center">
        <div className="flex flex-row flex-wrap flex-1 w-full gap-12 justify-between items-start">
          <PortfolioTotalHeader />
          <ConfidentialityRatioHeader />
        </div>
      </div>

      <div className="flex flex-col w-full text-start gap-4">
        <div className="text-2xl font-bold">Tokens</div>
        <div className="bg-base-300 bg-opacity-30">
          <PortfolioTokensTable />
        </div>
      </div>
    </div>
  );
};

export default Home;
