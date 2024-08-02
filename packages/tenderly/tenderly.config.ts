type NetworkConfig = {
  url: string,
  chainId: number,
  currency: string
}
export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = {
  // keep virtual_mainnet as the network name
  virtual_mainnet: {
    // TODO: Replace this with your actual configuration
    url: "???",
    chainId: -1,
    // use custom currency
    currency: "vETH",
  },
};