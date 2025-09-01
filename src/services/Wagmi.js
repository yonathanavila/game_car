import { createConfig, http } from "wagmi";
import { mainnet, sepolia, base } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

export const config = createConfig({
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
  },
  connectors: [metaMask(), miniAppConnector],
});
