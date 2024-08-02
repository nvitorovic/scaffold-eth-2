import * as fs from "fs";
import { virtualNetworks } from "../tenderly.config";
import child_process from "child_process";

const stageName = process.argv[2];
console.log(virtualNetworks);

function networkTypesUnion() {
  return `typeof ${Object.keys(virtualNetworks).join(" | typeof ")}`;
}

function networkNamesList(sep: string = "\n") {
  return `${Object.keys(virtualNetworks).join(`,${sep}`)}`;
}

function chainConfig(name: string, currency: string, rpcUrl: string, chainId: string): string {
  return `export const ${name} = {
  id: ${chainId} as const,
  name: "${name}",
  nativeCurrency: { name: "${currency}", symbol: "${currency}", decimals: 18 },
  rpcUrls: {
    default: { http: ["${rpcUrl}"] },
  },
  blockExplorers: {
    default: {
      name: "Tenderly Explorer",
      url: "${rpcUrl}",
    },
  },
};`;
}

(async function main() {
  const chainsConfig = await Promise.all(
    Object.entries(virtualNetworks).map(async vNet => {
      return chainConfig(vNet[0], "vETH", vNet[1].url!, vNet[1].chainId + "");
    }),
  );

  const tmpConfigFile = "next-tenderly.config.tss";

  if (fs.existsSync(tmpConfigFile)) {
    fs.rmSync(tmpConfigFile);
  }

  const nextConfig = `import { Chain } from "viem";

${chainsConfig.join("\n\n")}

type VirtualChains = [typeof ${networkNamesList(" typeof ")}];
export const virtualChains: VirtualChains = [${networkNamesList(" ")}];

export function isTenderlyVirtualNetwork(network: Chain) {
  return virtualChains.map(chain => chain.id as number).indexOf(network.id) > -1;
}
`;

  fs.writeFileSync(tmpConfigFile, nextConfig);
  fs.cpSync(tmpConfigFile, "../nextjs/tenderly.config.ts");
  child_process.execSync("npx prettier ../nextjs/tenderly.config.ts --write");
})();
