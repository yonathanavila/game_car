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
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");
        window.isFarcaster = true;

        const profile = sdk.context.user;

        if (profile) {
          console.log("Profile from sdk.context.user:", profile);
        } else {
          console.log("No user connected yet. Prompting sign-in...");
          if (window.connectWalletFarcaster) {
            await window.connectWalletFarcaster();
            console.log("Profile after sign-in:", sdk.context.user);
          }
        }

        // Subscribe to events safely
        if (sdk.events && typeof sdk.events.on === "function") {
          sdk.events.on("message", (msg) => {
            console.log("New Farcaster message:", msg);
          });
        } else {
          console.log("Farcaster events not available in this environment.");
        }
      } catch (err) {
        console.error("Farcaster SDK failed to initialize", err);
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
