type NetworkConfig = {
  url: string;
  chainId: number;
  currency: string;
};

export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = {
  virtual_mainnet: {
    url: "???",
    chainId: -1,
    currency: "VIRT",
  },
  virtual_base: {
    url: "???",
    chainId: -1,
    currency: "VIRT",
  },
};

// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}
