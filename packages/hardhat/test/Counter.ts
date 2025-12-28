/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { Counter, PermitV2 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { getTokensFromFaucet, unsealMockFheOpsSealed } from "./utils";
import { days, extractPermissionV2, FhenixJsPermitV2, generatePermitV2 } from "./permitUtils";
import { PermissionV2Struct } from "../typechain-types/contracts/Counter";

describe("Counter", function () {
  let signer: SignerWithAddress;

  let permitV2: PermitV2;
  let permitV2Address: string;

  let counter: Counter;
  let counterAddress: string;
  const counterProjectName = "COUNTER";

  let signerCounterPermit: FhenixJsPermitV2;
  let signerCounterPermission: PermissionV2Struct;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    await getTokensFromFaucet(hre, signer.address);

    const permitV2Factory = await ethers.getContractFactory("PermitV2");
    permitV2 = await permitV2Factory.deploy();
    await permitV2.waitForDeployment();
    permitV2Address = await permitV2.getAddress();

    // Create "COUNTER" project in permitV2
    await permitV2.createNewProject(counterProjectName);

    const counterFactory = await ethers.getContractFactory("Counter");
    counter = (await counterFactory.deploy(permitV2Address)) as Counter;
    await counter.waitForDeployment();
    counterAddress = await counter.getAddress();

    await permitV2.connect(signer).createNewPermit("SignerPermit", 30 * days, false, [], [counterProjectName]);
    const signerPermitId = await permitV2.tokenOfOwnerByIndex(signer.address, 0);
    signerCounterPermit = await generatePermitV2(
      permitV2Address,
      signer.address,
      signerPermitId,
      ethers.provider,
      signer,
    );
    signerCounterPermission = extractPermissionV2(signerCounterPermit);
  });

  describe("Deployment", function () {
    it("Should have the correct initial count on deploy", async function () {
      expect(await counter.getCounter(signer.address)).to.equal(0n);
    });

    it("should add amount to the counter successfully", async function () {
      const toCount = 10;

      // Before sending the amount to count to the Counter contract
      // It must first be encrypted outside the contract (within this test / frontend)
      const encToCount = await fhenixjs.encrypt_uint32(toCount);

      // Add to the counter
      await counter.connect(signer).add(encToCount);

      const sealedCountedAmount = await counter.connect(signer).getCounterPermitSealed(signerCounterPermission);
      const unsealedCountedAmount = fhenixjs.unseal(counterAddress, sealedCountedAmount.data, signer.address);

      expect(Number(unsealedCountedAmount) === toCount);
      expect(unsealedCountedAmount).to.equal(toCount, "The counted amount should increase by toCount");

      // The Counter contract has a view function that decrypts the counter as a sanity check
      // This function leaks data, and should not be used in prod
      const decryptedCountedAmount = await counter.getCounter(signer.address);
      expect(unsealedCountedAmount).to.equal(
        decryptedCountedAmount,
        "The unsealed and decrypted counted amount should match",
      );
    });
  });
});
