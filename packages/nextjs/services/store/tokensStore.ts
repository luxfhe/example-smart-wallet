import { processUnsealables, Unsealable } from "~~/utils/LuxFHE/unsealable";
import { create } from "zustand";
import { bigintToFloat } from "~~/utils/scaffold-eth/bigint";

export type TokenData = {
  address: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  encBalance: Unsealable<bigint>;
};

export type DerivedTokenData = TokenData & {
  totalBalance: Unsealable<bigint> | undefined;
  price: number | undefined;
  visValue: number | undefined;
  encValue: Unsealable<number> | undefined;
  totalValue: Unsealable<number> | undefined;
  encPerc: Unsealable<number> | undefined;
};

type TokensState = {
  refetchKey: number;
  refetchTokens: () => void;

  loadingPrices: boolean;
  setLoadingPrices: (loading: boolean) => void;

  tokenPrices: Record<string, number>;
  setTokenPrices: (prices: Record<string, number>) => void;

  tokensLoading: boolean;
  setTokensLoading: (loading: boolean) => void;

  tokens: TokenData[];
  setTokens: (tokens: TokenData[]) => void;
};

export const useTokensStore = create<TokensState>(set => ({
  refetchKey: 0,
  refetchTokens: () => set(state => ({ refetchKey: state.refetchKey + 1 })),

  loadingPrices: true,
  setLoadingPrices: loadingPrices => set({ loadingPrices }),

  tokenPrices: {},
  setTokenPrices: tokenPrices => set({ tokenPrices, loadingPrices: false }),

  tokensLoading: true,
  setTokensLoading: tokensLoading => set({ tokensLoading }),

  tokens: [],
  setTokens: tokens => set({ tokens, tokensLoading: false }),
}));

export const deriveTokenData = (token: TokenData, price: number): DerivedTokenData => {
  const totalBalance = processUnsealables([token.balance, token.encBalance], (bal, encBal) => bal + encBal);

  const encValue =
    price == null
      ? undefined
      : processUnsealables([token.encBalance, token.decimals], (encBal, dec) => bigintToFloat(encBal, dec) * price);

  const visValue = price == null ? undefined : bigintToFloat(token.balance, token.decimals) * price;

  const totalValue =
    price == null
      ? undefined
      : processUnsealables([totalBalance, token.decimals], (totalBal, dec) => bigintToFloat(totalBal, dec) * price);

  const encPerc =
    encValue == null || totalValue == null
      ? undefined
      : processUnsealables([encValue, totalValue], (encVal, totalVal) => (100 * encVal) / totalVal);

  return {
    ...token,
    totalBalance,
    price,
    visValue,
    encValue,
    totalValue,
    encPerc,
  };
};

export const useDerivedTokens = () => {
  return useTokensStore(state => {
    return state.tokens.map((token): DerivedTokenData => {
      const price = state.tokenPrices[token.symbol];
      return deriveTokenData(token, price);
    });
  });
};

export const usePortfolioSummaryData = () => {
  const derivedFherc20s = useDerivedTokens();

  const totalValue = processUnsealables(
    derivedFherc20s.map(token => token.totalValue),
    (...values) => {
      return values.reduce((acc, val) => acc + val, 0);
    },
  );
  const visValue = derivedFherc20s.reduce((acc, token) => acc + (token.visValue ?? 0), 0);
  const encValue = processUnsealables(
    derivedFherc20s.map(token => token.encValue),
    (...values) => {
      return values.reduce((acc, val) => acc + val, 0);
    },
  );

  const encPerc = processUnsealables([totalValue, encValue], (totalVal, encVal) =>
    totalVal === 0 ? 0 : (encVal * 100) / totalVal,
  );

  return {
    totalValue,
    visValue,
    encValue,
    encPerc,
  };
};
