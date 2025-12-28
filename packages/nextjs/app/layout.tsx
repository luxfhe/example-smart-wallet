import "@rainbow-me/rainbowkit/styles.css";
import "~~/styles/globals.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { Roboto_Mono } from "next/font/google";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { cookieToInitialState } from "@account-kit/core";
import { accountKitConfig } from "~~/account-kit.config";
import { headers } from "next/headers";

export const metadata = getMetadata({
  title: "Smart Wallet POC",
  description: "LuxFHE confidential data using AA",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const initialState = cookieToInitialState(accountKitConfig, headers().get("cookie") ?? undefined);

  return (
    <html suppressHydrationWarning className={robotoMono.className}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders initialState={initialState}>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
