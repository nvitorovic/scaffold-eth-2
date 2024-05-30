import { ethers, network } from "hardhat";
import { isTenderlyVirtualNetwork } from "../tenderly.config";

export async function tenderlyFund(address: string) {
  if (isTenderlyVirtualNetwork(network.config.chainId!)) {
    console.log("Current balance", await ethers.provider.getBalance(address));
    return await ethers.provider.send("tenderly_setBalance", [address, "0x56BC75E2D63100000"]);
  }
  return null;
}
