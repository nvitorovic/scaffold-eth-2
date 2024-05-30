import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { rainbowkitBurnerWallet } from "burner-connector";
import { Chain } from "viem";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { isTenderlyVirtualNetwork } from "~~/tenderly.config";

const { onlyLocalBurnerWallet, targetNetworks } = scaffoldConfig;

function mustUseActualWallet(network: Chain) {
  return network.id !== (chains.hardhat as chains.Chain).id && isTenderlyVirtualNetwork(network);
}

const wallets = [
  metaMaskWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  rainbowWallet,
  safeWallet,
  ...(!targetNetworks.some(mustUseActualWallet) && onlyLocalBurnerWallet ? [] : [rainbowkitBurnerWallet]),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],

  {
    appName: "scaffold-eth-2",
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
