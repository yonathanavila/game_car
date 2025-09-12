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
    new Game(); // Initialize Phaser game only once

    // Wait for Farcaster SDK to be ready
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");
        window.isFarcaster = true;
        const profile = await sdk.actions.getUserProfile();

        if (profile) {
          window.farcasterProfile = profile;
        }

        sdk.events.on("message", (msg) => {
          console.log("New Farcaster message:", msg);
        });
        // You can now use sdk.actions.* safely
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
