import { useFhenixReadContracts } from "./useFhenixReadContracts";
import { useDeployedContractInfo } from "../scaffold-eth";
import { useEffect } from "react";
import { TokenData, useTokensStore } from "~~/services/store/tokensStore";
import { processUnsealables } from "~~/utils/fhenix/unsealable";
import { useFhenixPermit } from "~~/permits/hooks";
import { useAccount } from "@account-kit/react";

const chunk = (a: any[], size: number) =>
  Array.from(new Array(Math.ceil(a.length / size)), (_, i) => a.slice(i * size, i * size + size));

export const useInitializeTokens = (fherc20Adds: string[]) => {
  const setTokensLoading = useTokensStore(state => state.setTokensLoading);
  const setTokens = useTokensStore(state => state.setTokens);
  const refetchKey = useTokensStore(state => state.refetchKey);
  const { address } = useAccount({ type: "LightAccount" });
  const permit = useFhenixPermit();

  const { data: fherc20Contract } = useDeployedContractInfo("FHERC20");
  const fherc20Abi = fherc20Contract?.abi as NonNullable<typeof fherc20Contract>["abi"];

  const { data, isLoading, refetch } = useFhenixReadContracts({
    contracts: fherc20Adds.flatMap(add => [
      {
        abi: fherc20Abi,
        address: add,
        functionName: "symbol",
      },
      {
        abi: fherc20Abi,
        address: add,
        functionName: "decimals",
      },
      {
        abi: fherc20Abi,
        address: add,
        functionName: "balanceOf",
        args: permit != null ? [permit.issuer] : address != null ? [address] : undefined,
      },
      {
        abi: fherc20Abi,
        address: add,
        functionName: "sealedBalanceOf",
        args: ["populate-fhenix-permission"],
      },
    ]),
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey]);

  useEffect(() => {
    if (isLoading) setTokensLoading(true);
  }, [isLoading, setTokensLoading]);

  useEffect(() => {
    if (data == null) return;

    const tokensData = chunk(data, 4).flatMap((tokenChunk, i) => {
      if (tokenChunk[0].status !== "success" || tokenChunk[1].status !== "success") return [];

      const encBalance = processUnsealables([permit, tokenChunk[3].result], (permit, encBal) => permit.unseal(encBal));

      return {
        address: fherc20Adds[i],
        symbol: tokenChunk[0].result,
        decimals: tokenChunk[1].result,
        balance: tokenChunk[2].result,
        encBalance,
      } as TokenData;
    });

    setTokens(tokensData);
  }, [data, fherc20Adds, permit, setTokens]);
};
