import { WagmiProvider } from "wagmi";
import { config } from "@/services/Wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectWallet } from "@/components/ConnectWallet";

export const Metamask = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectWallet />
      </QueryClientProvider>
    </WagmiProvider>
  );
};
