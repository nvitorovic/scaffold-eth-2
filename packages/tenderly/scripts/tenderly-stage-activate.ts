import * as fs from "fs";
import { readFileSync } from "fs";

if (!process.argv[2]) {
  throw new Error("Specify the stage name as the 1st argument of this script");
}

(async function main() {
  console.log("Activating env " + process.argv[1]);
  if (!process.argv[1]) {
    throw Error("Provide environment name (ls -l packages/tenderly/environments)");
  }
  const stageInfraConfig = JSON.parse(readFileSync("./environments/" + process.argv[2] + ".json").toString());
  const tmpConfigFile = "tenderly.config.ts";
  fs.writeFileSync(tmpConfigFile, `type NetworkConfig = {
  url: string,
  chainId: number,
  currency: string
}
export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = ${JSON.stringify(stageInfraConfig, null, 2)};


// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}

`);
})();
