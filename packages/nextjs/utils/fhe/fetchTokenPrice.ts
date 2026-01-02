import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pair, Route } from "@uniswap/v2-sdk";
import { Address, createPublicClient, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";
import { getAlchemyHttpUrl } from "../scaffold-eth/networks";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(getAlchemyHttpUrl(mainnet.id)),
});

const ABI = parseAbi([
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
]);

export const fetchTokenPrice = async (address: string, symbol: string, decimals: number): Promise<number> => {
  try {
    const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    if (address === DAI.address) return 1;

    const TOKEN = new Token(1, address, decimals);
    const pairAddress = Pair.getAddress(TOKEN, DAI) as Address;

    const wagmiConfig = {
      address: pairAddress,
      abi: ABI,
    };

    const [reserves, token0Address, token1Address] = await publicClient.multicall({
      contracts: [
        {
          ...wagmiConfig,
          functionName: "getReserves",
        },
        {
          ...wagmiConfig,
          functionName: "token0",
        },
        {
          ...wagmiConfig,
          functionName: "token1",
        },
      ],
    });

    if (reserves.status !== "success" || token0Address.status !== "success" || token1Address.status !== "success")
      throw new Error("Missing data");

    const token0 = [TOKEN, DAI].find(token => token.address === token0Address.result) as Token;
    const token1 = [TOKEN, DAI].find(token => token.address === token1Address.result) as Token;
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, reserves.result[0].toString()),
      CurrencyAmount.fromRawAmount(token1, reserves.result[1].toString()),
    );
    const route = new Route([pair], TOKEN, DAI);
    const price = parseFloat(route.midPrice.toSignificant(6));
    return price;
  } catch (error) {
    console.error(`fetchTokenPrice - Error fetching ${symbol} price from Uniswap: `, error);
    return 0;
  }
};
