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
    // Wait for Farcaster SDK to be ready
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");
        window.isFarcaster = true;
        const profile = sdk.context.user;

        if (profile) {
          console.log("Profile from sdk.context.user:", profile);
        } else {
          console.log("No user connected yet. Prompting sign-in...");

          // If you want, call connectWalletFarcaster
          if (window.connectWalletFarcaster) {
            await window.connectWalletFarcaster();
            const newProfile = sdk.context.user;
            console.log("Profile after sign-in:", newProfile);
          }
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
    new Game(); // Initialize Phaser game only once

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
