import { useReadContracts } from "wagmi";
import {
  FhenixContractFunctionArgs,
  FhenixMulticallReturnType,
  UseFhenixReadContractsParameters,
  UseFhenixReadContractsReturnType,
} from "~~/utils/fhenix/multicall";
import { useAccount } from "@account-kit/react";
import { useFhenixPermit } from "~~/permits/hooks";
import { Abi, ContractFunctionName } from "viem";
import { PermissionV2 } from "~~/permits/types";

export const injectPermission = <
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi>,
  argsIn = FhenixContractFunctionArgs<abi, "pure" | "view", functionName, true>,
  argsOut = FhenixContractFunctionArgs<abi, "pure" | "view", functionName, false>,
>(
  args: argsIn | unknown | undefined,
  permission: PermissionV2 | undefined,
): argsOut | undefined => {
  if (args == null) return undefined;
  return (args as any[]).map((arg: any) => (arg === "populate-fhenix-permission" ? permission : arg)) as argsOut;
};

export const useFhenixReadContracts = <
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  selectData = FhenixMulticallReturnType<contracts, allowFailure>,
>(
  parameters: UseFhenixReadContractsParameters<contracts, allowFailure, true>,
): UseFhenixReadContractsReturnType<contracts, allowFailure, selectData> => {
  const { address } = useAccount({ type: "LightAccount" });
  const permit = useFhenixPermit();

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
  }) as UseFhenixReadContractsReturnType<contracts, allowFailure, selectData>;
};
