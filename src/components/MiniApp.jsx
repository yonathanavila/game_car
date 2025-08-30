import { useEffect } from "preact/hooks";

import Game from "@/components/phaser/Game";
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {

  useEffect(() => {
    new Game(); // Initialize Phaser game only once


    // Wait for Farcaster SDK to be ready
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster MiniApp SDK is ready!");

        // Example: get user info
        const profile = await sdk.actions.getUserProfile();
        setUser(profile);

        // Example: listen for messages (Farcaster events)
        sdk.events.on('message', (msg) => {
          console.log('New Farcaster message:', msg);
        });
        // You can now use sdk.actions.* safely
      } catch (err) {
        console.error("Farcaster SDK failed to initialize", err);
      }
    };

    initFarcaster();
  }, []);



  return (
    <div className="App">
      <div id="game-container"></div>
    </div>
  );
}
