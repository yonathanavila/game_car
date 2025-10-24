import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const connectSmartWallet = async () => {
    const provider = window?.baseWalletProvider;

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
        params: [],
      });
      const universalAddress = accounts[0];
      if (universalAddress) {
        window.connectedAccount = universalAddress;
        return universalAddress;
      }
    } catch (error) {
      console.error("Failed to connect Base Account");
    }

    return null;
  };

  const connectViaWagmi = (connectorIndex = 0) => {
    if (!connectors?.length) {
      return null;
    }

    try {
      const connector = connectors[connectorIndex];

      const result = connect({ connector });

      const connectedAddress = result?.account || address;

      if (connectedAddress) {
        console.log(
          "Connected via connector:",
          connector.name,
          connectedAddress
        );

        window.connectedAccount = connectedAddress;

        return connectedAddress;
      }
    } catch (error) {
      console.error(
        `Failed to connect with connector ${connectorIndex}:`,
        error
      );
    }

    return null;
  };

  const connectWallet = async () => {
    let addr = await connectSmartWallet();

    // Metamask
    //if (!addr) addr = await connectViaWagmi(0);

    // Farcaster
    if (!addr && connectors?.length > 1) addr = await connectViaWagmi(1);

    if (!addr) console.error("No wallet could be connected");

    return addr;
  };

  useEffect(() => {
    window.connectWallet = async () => {
      return await connectWallet();
    };

    // If user already connected via wagmi
    if (isConnected && address) {
      window.connectedAccount = address;
    }
  }, [isConnected, address, connectors]);

  return null;
};
