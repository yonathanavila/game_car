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
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");

        window.isFarcaster = true;

        // sdk.context.user contains info about the connected wallet/user
        const user = sdk.context.user;

        if (user) {
          console.log("Farcaster wallet is connected!");
          console.log("FID:", user.fid);
          console.log("Username:", user.username);
          console.log("Display Name:", user.displayName);
          console.log("Profile Picture URL:", user.pfpUrl);
        } else {
          console.log("No Farcaster wallet connected yet.");

          // Optionally, trigger the wallet connection
          if (window.connectWalletFarcaster) {
            await window.connectWalletFarcaster();

            // After connecting, sdk.context.user is updated
            const connectedUser = sdk.context.user;
            if (connectedUser) {
              console.log("Farcaster wallet connected after signin!");
              console.log("FID:", connectedUser.fid);
              console.log("Username:", connectedUser.username);
            } else {
              console.log("User still not connected.");
            }
          }
        }
      } catch (err) {
        console.error("Farcaster SDK failed to initialize", err);
      }
    };

    new Game(); // Initialize Phaser game
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
