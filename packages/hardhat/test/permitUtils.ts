import {
  EIP712,
  EIP712Domain,
  EIP712Message,
  EIP712Types,
  GenerateSealingKey,
  PermitSigner,
  SealingKey,
  SupportedProvider,
} from "luxfhejs";
import { PermissionV2Struct } from "../typechain-types/contracts/Counter";

export const hours = 60 * 60;
export const days = hours * 24;

export const PermissionCategories = {
  EMPTY: 0,
  FHERC20: 1,
  DEFI: 2,
  ADMIN: 3,
};

export type LuxFHEJsPermitV2 = {
  contractAddress: string;
  sealingKey: SealingKey;
  signature: string;
  publicKey: string;
  permitId: string;
  issuer: string;
};

export const extractPermissionV2 = (permit: LuxFHEJsPermitV2): PermissionV2Struct => {
  return {
    issuer: permit.issuer,
    permitId: permit.permitId,
    publicKey: permit.publicKey,
    signature: permit.signature,
  };
};

const sign = async (
  signer: PermitSigner,
  domain: EIP712Domain,
  types: EIP712Types,
  value: EIP712Message,
): Promise<string> => {
  if ("_signTypedData" in signer && typeof signer._signTypedData == "function") {
    return await signer._signTypedData(domain, types, value);
  } else if ("signTypedData" in signer && typeof signer.signTypedData == "function") {
    return await signer.signTypedData(domain, types, value);
  }
  throw new Error("Unsupported signer");
};

// eslint-disable-next-line  @typescript-eslint/ban-types
export function determineRequestMethod(provider: SupportedProvider): Function {
  if ("request" in provider && typeof provider.request === "function") {
    return (p: SupportedProvider, method: string, params?: unknown[]) =>
      (p.request as ({ method, params }: { method: string; params?: unknown[] }) => Promise<unknown>)({
        method,
        params,
      });
  } else if ("send" in provider && typeof provider.send === "function") {
    return (p: SupportedProvider, method: string, params?: unknown[]) =>
      (p.send as (method: string, params?: unknown[]) => Promise<unknown>)(method, params);
  } else {
    throw new Error("Received unsupported provider. 'send' or 'request' method not found");
  }
}

// eslint-disable-next-line  @typescript-eslint/ban-types
export function determineRequestSigner(provider: SupportedProvider): Function {
  if ("getSigner" in provider && typeof provider.getSigner === "function") {
    return (p: SupportedProvider) => (p.getSigner as () => unknown)();
  } else {
    throw new Error("The supplied provider cannot get a signer");
  }
}

export const generatePermitV2 = async (
  contract: string,
  issuer: string,
  permitId: number | bigint,
  provider: SupportedProvider,
  customSigner?: PermitSigner,
): Promise<LuxFHEJsPermitV2> => {
  if (!provider) {
    throw new Error("Provider is undefined");
  }

  const requestMethod = determineRequestMethod(provider);

  let signer: PermitSigner;
  if (!customSigner) {
    const getSigner = determineRequestSigner(provider);
    signer = await getSigner(provider);
  } else {
    signer = customSigner;
  }

  const chainId = await requestMethod(provider, "eth_chainId", []);

  const keypair = await GenerateSealingKey();
  const msgParams: EIP712 = {
    types: {
      // This refers to the domain the contract is hosted on.
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      // Refer to primaryType.
      PermissionedV2: [
        { name: "issuer", type: "address" },
        { name: "permitId", type: "uint256" },
        { name: "publicKey", type: "bytes32" },
      ],
    },
    // This defines the message you're proposing the user to sign, is dapp-specific, and contains
    // anything you want. There are no required fields. Be as explicit as possible when building out
    // the message schema.
    // This refers to the keys of the following types object.
    primaryType: "PermissionedV2",
    domain: {
      name: "LuxFHE Permission v2.0.0",
      version: "v2.0.0",
      chainId,
      verifyingContract: contract,
    },
    message: {
      issuer,
      permitId: `${permitId}`,
      publicKey: `0x${keypair.publicKey}`,
    },
  };

  const msgSig = await sign(
    signer,
    msgParams.domain,
    { PermissionedV2: msgParams.types.PermissionedV2 },
    msgParams.message,
  );

  const permit: LuxFHEJsPermitV2 = {
    contractAddress: contract,
    sealingKey: keypair,
    signature: msgSig,
    publicKey: `0x${keypair.publicKey}`,
    permitId: `${permitId}`,
    issuer: issuer,
  };

  return permit;
};
