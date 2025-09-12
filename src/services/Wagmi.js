import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

const isFarcasterMiniApp = !!window.farcaster; // check if in miniapp

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [metaMask(), ...(isFarcasterMiniApp ? [miniAppConnector] : [])],
});
