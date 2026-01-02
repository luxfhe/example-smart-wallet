import { defineChain } from "viem";

export const LuxFHE_LOCAL_WEBSOCKETS_URL = "ws://127.0.0.1:42070";

// export const luxfheHelium = defineChain({});
//   id: 8008135,
//   name: "LuxFHE Helium",
//   network: "helium",
//   nativeCurrency: { name: "tFHE", symbol: "tFHE", decimals: 18 },
//   rpcUrls: {
//     public: {
//       http: ["https://api.helium.luxfhe.zone"],
//     },
//     default: {
//       http: ["https://api.helium.luxfhe.zone"],
//     },
//   },
//   blockExplorers: {
//     default: { name: "LuxFHE Explorer", url: "https://explorer.helium.luxfhe.zone" },
//   },
// });

export const luxfheNitrogen = defineChain({
  id: 8008148,
  name: "LuxFHE Nitrogen",
  network: "nitrogen",
  nativeCurrency: { name: "tFHE", symbol: "tFHE", decimals: 18 },
  rpcUrls: {
    public: {
      http: ["https://api.nitrogen.luxfhe.zone"],
    },
    default: {
      http: ["https://api.nitrogen.luxfhe.zone"],
    },
  },
  blockExplorers: {
    default: { name: "LuxFHE Explorer", url: "https://explorer.nitrogen.luxfhe.zone" },
  },
});

export const luxfheLocal = defineChain({
  id: 412346,
  name: "LuxFHE Local",
  network: "luxfheLocal",
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
    default: { name: "LuxFHE Local Explorer", url: "http://localhost:3000/blockexplorer" },
  },
});
