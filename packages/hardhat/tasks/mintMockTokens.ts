import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FHERC20 } from "../typechain-types";

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

const e6 = 10 * 10 ** 6;

task("task:mintMockTokens")
  .addPositionalParam("address", "Wallet Address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { luxfhe, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    if ((await ethers.provider.getBalance(signer.address)).toString() === "0") {
      await luxfhe.getFunds(signer.address);
    }

    console.log(`Minting mock fherc20 tokens for ${taskArguments.address}`);

    for (const { symbol, decimals } of MockTokens) {
      const fherc20Deployment = await deployments.get(symbol);
      const Fherc20 = (await ethers.getContractAt("FHERC20", fherc20Deployment.address)) as unknown as FHERC20;
      const amount = BigInt(Math.round(Math.random() * e6)) * 10n ** BigInt(decimals - 6);
      const tx = await Fherc20.mint(taskArguments.address, amount);
      await tx.wait();
      const encAmount = BigInt(Math.round(Math.random() * e6)) * 10n ** BigInt(decimals - 6);
      const encTx = await Fherc20.encMint(taskArguments.address, encAmount);
      await encTx.wait();
      console.log(`${symbol} :: Minted ${amount} ${symbol}`);
      console.log(`${symbol} :: Minted ${encAmount} e${symbol}`);
    }
  });
