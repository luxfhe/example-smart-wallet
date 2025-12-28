import { AlchemyAccountsUIConfig, cookieStorage, createConfig as createAccountKitConfig } from "@account-kit/react";
import { alchemy, sepolia } from "@account-kit/infra";
import scaffoldConfig from "./scaffold.config";
// TODO: Re-introduce fhenix nitrogen once it is added to alchemy account-kit

const accountKitUiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [{ type: "passkey" }, { type: "social", authProviderId: "google", mode: "popup" }],
      // NOTE: Disabled for POC
      // [
      //   {
      //     type: "external_wallets",
      //     walletConnect: { projectId: scaffoldConfig.walletConnectProjectId },
      //   },
      // ],
    ],
    addPasskeyOnSignup: false,
  },
};

export const accountKitConfig = createAccountKitConfig(
  {
    transport: alchemy({ apiKey: scaffoldConfig.alchemyApiKey }),
    chain: sepolia,
    ssr: true, // more about ssr: https://accountkit.alchemy.com/react/ssr
    storage: cookieStorage, // more about persisting state with cookies: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state
    enablePopupOauth: true, // must be set to "true" if you plan on using popup rather than redirect in the social login flow
  },
  accountKitUiConfig,
);
