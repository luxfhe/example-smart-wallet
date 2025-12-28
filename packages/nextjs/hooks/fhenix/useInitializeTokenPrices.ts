import { useCallback, useEffect } from "react";
import { MainnetFherc20s } from "~~/contracts/mainnetFherc20s";
import { useTokensStore } from "~~/services/store/tokensStore";
import { fetchTokenPrice } from "~~/utils/LuxFHE/fetchTokenPrice";

export const useInitializeTokenPrices = () => {
  const setTokenPrices = useTokensStore(state => state.setTokenPrices);
  const setLoadingPrices = useTokensStore(state => state.setLoadingPrices);

  const fetchPrices = useCallback(async () => {
    setLoadingPrices(true);
    const fetchedPrices = await Promise.all(
      MainnetFherc20s.map(fherc20 => fetchTokenPrice(fherc20.address, fherc20.symbol, fherc20.decimals)),
    );

    const tokenPrices: Record<string, number> = {};
    for (let i = 0; i < fetchedPrices.length; i++) {
      tokenPrices[MainnetFherc20s[i].symbol] = fetchedPrices[i];
    }

    setTokenPrices(tokenPrices);
  }, [setLoadingPrices, setTokenPrices]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // useInterval(fetchPrices, scaffoldConfig.pollingInterval);
};
