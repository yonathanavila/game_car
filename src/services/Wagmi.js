import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

const isFarcasterMiniApp = !!window.farcaster; // check if in miniapp

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [metaMask(), ...(isFarcasterMiniApp ? [miniAppConnector] : [])],
});
