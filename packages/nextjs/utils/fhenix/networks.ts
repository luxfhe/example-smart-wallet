import { defineChain } from "viem";

export const FHENIX_LOCAL_WEBSOCKETS_URL = "ws://127.0.0.1:42070";

// export const fhenixHelium = defineChain({});
//   id: 8008135,
//   name: "Fhenix Helium",
//   network: "helium",
//   nativeCurrency: { name: "tFHE", symbol: "tFHE", decimals: 18 },
//   rpcUrls: {
//     public: {
//       http: ["https://api.helium.fhenix.zone"],
//     },
//     default: {
//       http: ["https://api.helium.fhenix.zone"],
//     },
//   },
//   blockExplorers: {
//     default: { name: "Fhenix Explorer", url: "https://explorer.helium.fhenix.zone" },
//   },
// });

export const fhenixNitrogen = defineChain({
  id: 8008148,
  name: "Fhenix Nitrogen",
  network: "nitrogen",
  nativeCurrency: { name: "tFHE", symbol: "tFHE", decimals: 18 },
  rpcUrls: {
    public: {
      http: ["https://api.nitrogen.fhenix.zone"],
    },
    default: {
      http: ["https://api.nitrogen.fhenix.zone"],
    },
  },
  blockExplorers: {
    default: { name: "Fhenix Explorer", url: "https://explorer.nitrogen.fhenix.zone" },
  },
});

export const fhenixLocal = defineChain({
  id: 412346,
  name: "Fhenix Local",
  network: "fhenixLocal",
  nativeCurrency: { name: "tFHE", symbol: "tFHE", decimals: 18 },
  rpcUrls: {
    public: {
      http: ["http://127.0.0.1:42069"],
    },
    default: {
      http: ["http://127.0.0.1:42069"],
    },
  },
  blockExplorers: {
    default: { name: "Fhenix Local Explorer", url: "http://localhost:3000/blockexplorer" },
  },
});
