import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

const isFarcasterMiniApp = !!window.farcaster; // check if in miniapp

// Your custom RPC URL
const BASE_RPC_URL =
  import.meta.env.RCP_URL ||
  "https://base-mainnet.g.alchemy.com/v2/rN0cqRG5Wu20l1iOzOx-0tS2iIm5al1N";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC_URL),
  },
  connectors: [metaMask(), ...(isFarcasterMiniApp ? [miniAppConnector] : [])],
});
