"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { useInitializeTokenPrices } from "~~/hooks/fhenix/useInitializeTokenPrices";
import { useInitializeTokens } from "~~/hooks/fhenix/useInitializeTokens";
import FHERC20s from "~~/contracts/FHERC20s.json";
import { AlchemyAccountProvider } from "@account-kit/react";
import { accountKitConfig } from "~~/account-kit.config";
import { AlchemyClientState } from "@account-kit/core";
import { PermitV2Modal } from "./PermitModal";
import { useInitializePermitModalAccessRequirements } from "~~/services/store/permitModalStore";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();
  useInitializeTokenPrices();
  useInitializeTokens(FHERC20s);
  useInitializePermitModalAccessRequirements({ projects: ["FHERC20", "UNISWAP"] });

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
      </div>
      <PermitV2Modal />
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({
  initialState,
  children,
}: {
  initialState?: AlchemyClientState;
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider config={accountKitConfig} queryClient={queryClient} initialState={initialState}>
          <ProgressBar />
          <RainbowKitProvider
            avatar={BlockieAvatar}
            theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
          >
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RainbowKitProvider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
