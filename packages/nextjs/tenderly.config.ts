import { Chain } from "viem";

export const virtual_zetachain = {
  id: -1 as const,
  name: "virtual_mainnet",
  nativeCurrency: { name: "vETH", symbol: "vETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["???"] },
  },
  blockExplorers: {
    default: {
      name: "Tenderly Explorer",
      url: "???",
    },
  },
};

type VirtualChains = [typeof virtual_zetachain];
export const virtualChains: VirtualChains = [virtual_zetachain];

export function isTenderlyVirtualNetwork(network: Chain) {
  return virtualChains.map(chain => chain.id as number).indexOf(network.id) > -1;
}
