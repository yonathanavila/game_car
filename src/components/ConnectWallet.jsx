import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const [session, setSession] = useState(null);

  useEffect(() => {
    // Exponer función global para Phaser
    window.connectWalletMetamask = () => {
      if (connectors?.length > 0) {
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

    if (isConnected) {
      window.connectedAccount = address;
    } else {
      window.connectedAccount = null;
    }
  }, [connect, connectors, address, isConnected]);

  return null;
};
