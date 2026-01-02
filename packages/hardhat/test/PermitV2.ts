import { expect } from "chai";
import hre, { ethers, luxfhe } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  getLastBlockTimestamp,
  getTokensFromFaucet,
  revertSnapshot,
  takeSnapshot,
  unsealMockFheOpsSealed,
  withinSnapshot,
} from "./utils";
import { Counter } from "../typechain-types/contracts/Counter";
import { PermitV2 } from "../typechain-types";
import { days, extractPermissionV2, generatePermitV2 } from "./permitUtils";

describe("PermitV2", function () {
  let snapshotId: string;

  let signer: SignerWithAddress;
  let bob: SignerWithAddress;
  let ada: SignerWithAddress;

  let permitV2: PermitV2;
  let permitV2Address: string;

  const CounterProjectName = "COUNTER";

  let counter1: Counter;
  let counter1Address: string;

  let counter2: Counter;
  let counter2Address: string;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    bob = (await ethers.getSigners())[1];
    ada = (await ethers.getSigners())[2];

    await getTokensFromFaucet(hre, signer.address);
    await getTokensFromFaucet(hre, bob.address);
    await getTokensFromFaucet(hre, ada.address);

    const permitV2Factory = await ethers.getContractFactory("PermitV2");
    permitV2 = await permitV2Factory.deploy();
    await permitV2.waitForDeployment();
    permitV2Address = await permitV2.getAddress();

    // Create "COUNTER" project in permitV2
    await permitV2.createNewProject(CounterProjectName);

    const counterFactory = await ethers.getContractFactory("Counter");
    counter1 = await counterFactory.deploy(permitV2Address);
    await counter1.waitForDeployment();
    counter1Address = await counter1.getAddress();

    counter2 = await counterFactory.deploy(permitV2Address);
    await counter2.waitForDeployment();
    counter2Address = await counter2.getAddress();
  });

  beforeEach(async () => {
    snapshotId = await takeSnapshot(hre);
  });

  afterEach(async () => {
    await revertSnapshot(hre, snapshotId);
  });

  it("creating permit should succeed", async () => {
    await expect(permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], [CounterProjectName]))
      .to.emit(permitV2, "PermitV2Created")
      .withArgs(bob.address, 1);

    const permitInfo = await permitV2.getPermitInfo(1);
    const timestamp = await getLastBlockTimestamp(hre);

    expect(permitInfo.id).to.eq(1, "First permit");
    expect(permitInfo.issuer).to.eq(bob.address, "Bob issued the permit");
    expect(permitInfo.name).to.eq("BobPermit", "Permit name is correct");
    expect(permitInfo.holder).to.eq(bob.address, "Bob holds the permit");
    expect(permitInfo.createdAt).to.eq(timestamp, "Timestamp correct");
    expect(permitInfo.validityDur).to.eq(30 * days, "Validity duration set correctly");
    expect(permitInfo.expiresAt).to.eq(timestamp + 30 * days, "Expiration date correctly set");
    expect(permitInfo.fineGrained).to.eq(false, "Permit not fine grained");
    expect(permitInfo.revoked).to.eq(false, "Permit not revoked");
    expect(permitInfo.contracts).to.deep.eq([], "No contracts added (not fine grained)");
    expect(permitInfo.projects).to.deep.eq([CounterProjectName], "Projects are [DEFI]");
    expect(permitInfo.routers).to.deep.eq([], "Routers are []");
  });

  it("Permits can be used to access contract data", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], [CounterProjectName]);

    await counter1.connect(bob).add(await luxfhe.encrypt_uint32(5));
    await counter2.connect(bob).add(await luxfhe.encrypt_uint32(3));

    expect(await counter1.getCounter(bob.address)).to.eq(5, "Bob's counter1 value should be added");
    expect(await counter2.getCounter(bob.address)).to.eq(3, "Bob's counter2 value should be added");

    // Single permission for multiple contracts
    const permit = await generatePermitV2(permitV2Address, bob.address, permitId, ethers.provider, bob);
    const permission = extractPermissionV2(permit);

    const c1sealed = await counter1.connect(bob).getCounterPermitSealed(permission);

    const c1unsealed = unsealMockFheOpsSealed(c1sealed.data);
    // const unsealed = permit.sealingKey.unseal(sealed);

    expect(c1unsealed).to.eq(5, "Bobs counter1 unsealed value should match");

    const c2sealed = await counter2.connect(bob).getCounterPermitSealed(permission);

    const c2unsealed = unsealMockFheOpsSealed(c2sealed.data);
    // const unsealed = permit.sealingKey.unseal(sealed);

    expect(c2unsealed).to.eq(3, "Bobs counter2 unsealed value should match");
  });

  it("Permits can be fine grained", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, true, [counter1Address], []);

    await counter1.connect(bob).add(await luxfhe.encrypt_uint32(5));
    await counter2.connect(bob).add(await luxfhe.encrypt_uint32(3));

    expect(await counter1.getCounter(bob.address)).to.eq(5, "Bob's counter1 value should be added");
    expect(await counter2.getCounter(bob.address)).to.eq(3, "Bob's counter2 value should be added");

    // Single permission for multiple contracts
    const permit = await generatePermitV2(permitV2Address, bob.address, permitId, ethers.provider, bob);
    const permission = extractPermissionV2(permit);

    await counter1.connect(bob).getCounterPermitSealed(permission);

    await expect(counter2.connect(bob).getCounterPermitSealed(permission)).to.be.revertedWithCustomError(
      permitV2,
      "PermitContractUnauthorized",
    );
  });

  it("Permits can be revoked", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], [CounterProjectName]);

    await counter1.connect(bob).add(await luxfhe.encrypt_uint32(5));

    // Single permission for multiple contracts
    const permit = await generatePermitV2(permitV2Address, bob.address, permitId, ethers.provider, bob);
    const permission = extractPermissionV2(permit);

    // Expect not to revert
    await counter1.connect(bob).getCounterPermitSealed(permission);

    await permitV2.connect(bob).revokePermit(permitId);

    await expect(counter1.connect(bob).getCounterPermitSealed(permission)).to.be.revertedWithCustomError(
      permitV2,
      "PermitRevoked",
    );
  });

  it("Permits can expire (and be renewed)", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], [CounterProjectName]);
    const bobPermit = await permitV2.getPermitInfo(permitId);
    const expiration = bobPermit.expiresAt + 1n;

    await counter1.connect(bob).add(await luxfhe.encrypt_uint32(5));

    // Single permission for multiple contracts
    const permit = await generatePermitV2(permitV2Address, bob.address, permitId, ethers.provider, bob);
    const permission = extractPermissionV2(permit);

    // Expect not to revert
    await counter1.connect(bob).getCounterPermitSealed(permission);

    await time.increaseTo(expiration);

    await expect(counter1.connect(bob).getCounterPermitSealed(permission)).to.be.revertedWithCustomError(
      permitV2,
      "PermitExpired",
    );
  });

  it("Permits can be transferred (and revoked while transferred)", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], [CounterProjectName]);

    await counter1.connect(bob).add(await luxfhe.encrypt_uint32(5));
    await counter2.connect(bob).add(await luxfhe.encrypt_uint32(3));

    permitV2.connect(bob).transferFrom(bob.address, ada.address, permitId);

    // Single permission for multiple contracts
    const permit = await generatePermitV2(
      permitV2Address,
      bob.address, // Bob issued the permit,
      permitId,
      ethers.provider,
      ada, // But Ada is using it.
    );
    const permission = extractPermissionV2(permit);

    const c1sealed = await counter1.connect(ada).getCounterPermitSealed(permission);

    const c1unsealed = unsealMockFheOpsSealed(c1sealed.data);
    // const unsealed = permit.sealingKey.unseal(sealed);

    expect(c1unsealed).to.eq(5, "Ada can see bob's counter1 unsealed value");

    const c2sealed = await counter2.connect(ada).getCounterPermitSealed(permission);

    const c2unsealed = unsealMockFheOpsSealed(c2sealed.data);
    // const unsealed = permit.sealingKey.unseal(sealed);

    expect(c2unsealed).to.eq(3, "Ada can see bob's counter2 unsealed value");

    // Bob can revoke this permit

    await permitV2.connect(bob).revokePermit(permitId);

    await expect(counter1.connect(ada).getCounterPermitSealed(permission)).to.be.revertedWithCustomError(
      permitV2,
      "PermitRevoked",
    );
  });

  it("Permit satisfies contract", async () => {
    const permitId = 1;

    // Coarse succeeds
    await withinSnapshot(hre, async () => {
      await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], ["FHERC20", CounterProjectName]);

      expect(await permitV2.permitSatisfiesContract(permitId, counter1Address)).to.eq(
        true,
        "Coarse permit with correct projects satisfies counter",
      );
    });

    // Coarse fails - not implemented PermissionedV2
    await withinSnapshot(hre, async () => {
      await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], ["FHERC20", CounterProjectName]);

      expect(await permitV2.permitSatisfiesContract(permitId, permitV2Address)).to.eq(
        false,
        "Contract that does not implement PermissionedV2 fails but not reverts",
      );

      expect(await permitV2.permitSatisfiesContract(permitId, bob.address)).to.eq(false, "EOA fails but not reverts");
    });

    // Coarse fails
    await withinSnapshot(hre, async () => {
      await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], ["ADMIN"]);

      expect(await permitV2.permitSatisfiesContract(permitId, counter1Address)).to.eq(
        false,
        "Coarse permit with incorrect projects does not satisfies counter",
      );
    });

    // Fine succeeds
    await withinSnapshot(hre, async () => {
      await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, true, [counter1Address, counter2Address], []);

      expect(await permitV2.permitSatisfiesContract(permitId, counter1Address)).to.eq(
        true,
        "Fine permit with correct contracts satisfies counter",
      );
    });

    // Fine fails
    await withinSnapshot(hre, async () => {
      await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, true, [counter2Address], []);

      expect(await permitV2.permitSatisfiesContract(permitId, counter1Address)).to.eq(
        false,
        "Fine permit with incorrect contracts does not satisfies counter",
      );
    });
  });

  it("Permit tokenURI data correct (course grain)", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, false, [], ["FHERC20", CounterProjectName]);

    const uri = await permitV2.tokenURI(permitId);
    const base64Data = uri.split(",")[1];
    const jsonString = atob(base64Data);
    const jsonData = JSON.parse(jsonString);
    console.log(JSON.stringify(jsonData, null, 2));
  });

  it("Permit tokenURI data correct (fine grain)", async () => {
    const permitId = 1;

    await permitV2.connect(bob).createNewPermit("BobPermit", 30 * days, true, [counter1Address, counter2Address], []);

    const uri = await permitV2.tokenURI(permitId);
    const base64Data = uri.split(",")[1];
    const jsonString = atob(base64Data);
    console.log({
      jsonString,
    });
    const jsonData = JSON.parse(jsonString);
    console.log(JSON.stringify(jsonData, null, 2));
  });
});
