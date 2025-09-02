import { useEffect } from "react";
import { useConnect } from "wagmi";

export const ConnectWallet = () => {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    // Exponer función global para Phaser
    window.connectWalletMetamask = () => {
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        console.error("No wallet connectors found");
      }
    };

    // Exponer función global para Phaser
    window.connectWalletFarcaster = () => {
      if (connectors.length > 0) {
        connect({ connector: connectors[1] });
      } else {
        console.error("No wallet connectors found");
      }
    };
  }, [connect, connectors]);

  return null;
};
