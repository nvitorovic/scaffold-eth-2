import * as fs from "fs";
import { readFileSync } from "fs";

if (!process.argv[2]) {
  console.error("Specify environment name or create a new one using stage:new");
  const files = fs.readdirSync("environments");
  console.log(files.join("\n"));
  process.exit(1);
}

(async function main() {
  console.log("Activating env " + process.argv[1]);
  const stageInfraConfig = JSON.parse(readFileSync("./environments/" + process.argv[2] + ".json").toString());
  const tmpConfigFile = "tenderly.config.ts";
  fs.writeFileSync(tmpConfigFile, `type NetworkConfig = {
  url: string;
  chainId: number;
  currency: string;
};

export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = ${JSON.stringify(stageInfraConfig, null, 2)};

// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}
`);
})();
