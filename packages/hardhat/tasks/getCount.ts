import { Counter } from "../typechain-types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:getCount").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { luxfhejs, ethers, deployments } = hre;
  const [signer] = await ethers.getSigners();

  const Counter = await deployments.get("Counter");

  console.log(`Running getCount, targeting contract at: ${Counter.address}`);

  const contract = (await ethers.getContractAt("Counter", Counter.address)) as unknown as unknown as Counter;

  const permit = await luxfhejs.generatePermit(
    Counter.address,
    undefined, // use the internal provider
    signer,
  );

  const result = await contract.getCounterPermit(permit);
  console.log(`got count: ${result.toString()}`);

  const sealedResult = await contract.getCounterPermitSealed(permit);
  const unsealed = luxfhejs.unseal(Counter.address, sealedResult.data);

  console.log(`got unsealed result: ${unsealed.toString()}`);
});
