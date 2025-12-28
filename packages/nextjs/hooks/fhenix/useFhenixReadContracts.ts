import { useReadContracts } from "wagmi";
import {
  LuxFHEContractFunctionArgs,
  LuxFHEMulticallReturnType,
  UseLuxFHEReadContractsParameters,
  UseLuxFHEReadContractsReturnType,
} from "~~/utils/LuxFHE/multicall";
import { useAccount } from "@account-kit/react";
import { useLuxFHEPermit } from "~~/permits/hooks";
import { Abi, ContractFunctionName } from "viem";
import { PermissionV2 } from "~~/permits/types";

export const injectPermission = <
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi>,
  argsIn = LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, true>,
  argsOut = LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, false>,
>(
  args: argsIn | unknown | undefined,
  permission: PermissionV2 | undefined,
): argsOut | undefined => {
  if (args == null) return undefined;
  return (args as any[]).map((arg: any) => (arg === "populate-LuxFHE-permission" ? permission : arg)) as argsOut;
};

export const useLuxFHEReadContracts = <
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  selectData = LuxFHEMulticallReturnType<contracts, allowFailure>,
>(
  parameters: UseLuxFHEReadContractsParameters<contracts, allowFailure, true>,
): UseLuxFHEReadContractsReturnType<contracts, allowFailure, selectData> => {
  const { address } = useAccount({ type: "LightAccount" });
  const permit = useLuxFHEPermit();

  const transformedContracts = parameters?.contracts?.map((contract: any) => {
    if (contract.args == null) return contract;
    return {
      ...contract,
      args: injectPermission(contract.args, permit?.getPermission()),
      account: address,
    };
  });

  return useReadContracts({
    ...(parameters as any),
    contracts: transformedContracts,
    query: {
      select: data => {
        return data.map(item => {
          if (item.status === "failure") return item;
          return {
            ...item,
            result: permit == null ? item.result : permit.unseal(item.result),
          };
        });
      },
      ...parameters.query,
    },
  }) as UseLuxFHEReadContractsReturnType<contracts, allowFailure, selectData>;
};
