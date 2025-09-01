import { useAccount, useConnect, useDisconnect } from "wagmi";

export const ConnectWallet = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <>
        <div>You're connected!</div>
        <div>Address: {address}</div>
        <button
          className="bg-blue-700 px-6 py-3 rounded-full cursor-pointer"
          type="button"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </>
    );
  }
  return (
    <button
      className="bg-blue-700 px-6 py-3 rounded-full cursor-pointer"
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect
    </button>
  );
};
