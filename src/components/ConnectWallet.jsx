import { useEffect } from "react";
import { useConnect, useAccount, useChainId } from "wagmi";

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();

  const GetOrCreateAccount = async () => {
    const response = await fetch("/api/wallets/get-wallet.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
      }),
    });
    console.log(response);
  };

  useEffect(() => {
    if (address) {
      GetOrCreateAccount();
    }
  }, [address]);

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

    if (isConnected) {
      window.connectedAccount = address;
    } else {
      window.connectedAccount = null;
    }
  }, [connect, connectors, address, isConnected]);

  return null;
};
