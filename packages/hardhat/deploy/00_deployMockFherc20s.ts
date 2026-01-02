import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";

type MockToken = {
  symbol: string;
  decimals: number;
};
const MockTokens: MockToken[] = [
  { symbol: "ETH", decimals: 18 },
  { symbol: "wBTC", decimals: 8 },
  { symbol: "UNI", decimals: 18 },
  { symbol: "LINK", decimals: 18 },
  { symbol: "MATIC", decimals: 18 },
  { symbol: "USDC", decimals: 6 },
  { symbol: "USDT", decimals: 6 },
  { symbol: "DAI", decimals: 18 },
];

const deployMockFherc20s: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  console.log({ deployer });
  const { deploy } = hre.deployments;

  // Fund the account before deploying.
  if (hre.network.name === "localluxfhe") {
    if ((await hre.ethers.provider.getBalance(deployer)) === 0n) {
      await hre.luxfhe.getFunds(deployer);
      console.log("Received tokens from the local faucet. Ready to deploy...");
    }
  }

  // Deploy plain FHERC20 to get abi in frontend
  await deploy("FHERC20", {
    from: deployer,
    args: [`MOCK FHERC20 Token`, "MOCK", 18],
    log: true,
    autoMine: true,
  });

  const deployedMockTokens = [] as string[];

  for (const token of MockTokens) {
    const deployResult = await deploy(token.symbol, {
      contract: "FHERC20",
      from: deployer,
      args: [`${token.symbol} FHERC20 Token`, token.symbol, token.decimals],
      log: true,
      autoMine: true,
    });
    deployedMockTokens.push(deployResult.address);
  }

  const TARGET_DIR = "../nextjs/contracts/";

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR);
  }

  fs.writeFileSync(`${TARGET_DIR}FHERC20s.json`, JSON.stringify(deployedMockTokens, null, 2));

  console.log(`📝 Updated Deployed FHERC20s json file at ${TARGET_DIR}FHERC20s.json`);
};

export default deployMockFherc20s;

deployMockFherc20s.tags = ["MockFherc20s"];
