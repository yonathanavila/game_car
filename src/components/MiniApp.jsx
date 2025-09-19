import { WagmiProvider } from "wagmi";
import { useEffect } from "react";

import { config } from "@/services/Wagmi";
import Game from "@/components/phaser/Game";
import { sdk } from "@farcaster/miniapp-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function MiniApp() {
  const queryClient = new QueryClient();
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Wait for SDK to be ready
        await sdk.actions.addMiniApp();
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");
        window.isFarcaster = true;
      } catch (err) {
        console.error("Farcaster SDK failed to initialize", err);
        window.isFarcaster = false;
      }
    };

    initFarcaster();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <ConnectWallet />
          <div id="game-container"></div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
