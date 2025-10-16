import { ConnectWallet } from "@/components/ConnectWallet";
import Game from "@/components/phaser/Game";

import { config } from "@/services/Wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { WagmiProvider } from "wagmi";

export default function MiniApp() {
  const queryClient = new QueryClient();

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Wait for SDK to be ready
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");
        await sdk.actions.addMiniApp();

        window.isFarcaster = true;
      } catch (err) {
        console.error("Farcaster SDK failed to initialize", err);
        window.isFarcaster = false;
      }
    };

    new Game();
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
