import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import * as dotenv from "dotenv";
import { mkdirSync } from "fs";

dotenv.config();

const GIT_REF_NAME = process.env.GIT_REF_NAME;
const GIT_SHA = process.env.GIT_SHA;

const environmentVariablesHelp = {
  "TENDERLY_ACCOUNT_ID": "Tenderly account id (https://docs.tenderly.co/account/projects/account-project-slug)",
  "TENDERLY_PROJECT_ID": "Tenderly project slug (https://docs.tenderly.co/account/projects/account-project-slug)",
  "TENDERLY_ACCESS_TOKEN": "Tenderly access token (https://docs.tenderly.co/account/projects/how-to-generate-api-access-token)",
  "TENDERLY_SKIP_CHAINID_PREFIX": "Skip prefixing chain ID when creating a Virtual Testnet.",
  "TENDERLY_CHAINID_PREFIX": "Optional chain ID prefix. By default, the command prefixes every chain ID with 7357.",
  "ABSOLUTE_SLUG": "Use absolute slug to name your Virtual TestNet. Unless specified, the slug will contain environment name, network name, and Git commit's SHA.",
};

async function checkEnvAndArgs() {

  if (process.argv[2] == "--help") {
    console.log("" +
      "Run the command as" +
      "tenderly:stage:new <environment name> <chain1> <chain2>...");
    console.log(`Use the following environment variables for finer control, e.g.:

TENDERLY_CHAINID_PREFIX=999 yarn stage:new my_cool_env 1 8453
`);
    console.log(Object.keys(environmentVariablesHelp).sort().map((env: unknown) => `${env}\t\t ${environmentVariablesHelp[env as keyof typeof environmentVariablesHelp]}`).join("\n"));
    return;
  }

  if (process.argv.length < 4) {
    // TODO: replace with an SDK function
    const networks = await getNetworks();
    console.log(`Specify a list of network IDs you need for this environment:
${networks.map((network) => network.slug + " (" + network.id + ")").join("\n")}`);
    process.exit(1);
  }

  const missingValues = [
    "GIT_REF_NAME",
    "GIT_SHA",
    "TENDERLY_ACCOUNT_ID",
    "TENDERLY_PROJECT_ID",
    "TENDERLY_ACCESS_TOKEN",
  ].filter(envVar => !process.env[envVar]);

  if (missingValues.length > 0) {
    if (!existsSync(".env")) {
      copyFileSync(".env.example", ".env");
    }
    throw new Error("Configure the following environment variables (.env file): \n" + missingValues.join("=\n") + "=\n");
  }
}

async function createTestnet(networkId: number, chainId: number, environmentSlug: any) {
  const accountId = process.env.TENDERLY_ACCOUNT_ID;
  // Replace with your actual account ID
  const projectSlug = process.env.TENDERLY_PROJECT_ID;

  const apiUrl = `https://api.tenderly.co/api/v1/account/${accountId}/project/${projectSlug}/vnets`;
  // const apiUrl = `https://api.tenderly.co/api/v1/account/${accountId}/project/${projectSlug}/testnet/container`;

  try {
    console.log(environmentSlug);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": process.env.TENDERLY_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        slug: environmentSlug,
        fork_config: {
          network_id: networkId,
        },
        virtual_network_config: {
          chain_config: {
            chain_id: chainId,
          },
          base_fee_per_gas: 1,
        },
        sync_state_config: {
          enabled: true,
        },
        explorer_page_config: {
          enabled: true,
          verification_visibility: "abi",
        },
      }),
    });

    if (response.ok) {

      const data = await response.json() as {
        rpcs: {
          name: string,
          url: string
        }[]
      };

      const rpcUrl = data.rpcs.filter((rpc: any) => rpc.name == "Admin RPC")[0].url;

      // TODO: filter
      console.log(`RPC URL: ${rpcUrl}`);
      return rpcUrl;
    } else {
      console.error(`Failed to create testnet. Status code: ${response.status}` + await response.text());

    }
  } catch (error: any) {
    console.error(`Error creating testnet: ${error.message}`);
  }
}


async function getNetworks() {
  type NetworkInfo = {
    slug: string,
    id: string
  }
  const networks: NetworkInfo[] = await (await fetch("https://api.tenderly.co/api/v1/public-networks", {
    "headers": {
      "X-Access-Key": process.env.TENDERLY_ACCESS_TOKEN!,
    },

  })).json();
  return networks.sort((net1, net2) => net1.slug.localeCompare(net2.slug));
}

// Example usage
async function main() {
  function getEnvironmentName() {
    const environmentName = process.argv[2];
    if (environmentName == "now" || !environmentName) {
      return `${Date.now()}`;
    }
    return environmentName;
  }

  // Get the name parameter from the command line arguments
  const environmentName = getEnvironmentName();
  writeFileSync(".environment", `export ENVIRONMENT_NAME=${environmentName}`);
  process.env.TEST_NODESCRIPT = "yeah";
  const chains: Record<string, any> = {};
  const networks = await getNetworks();

  for (let i = 3; i < process.argv.length; i++) {
    const networkId = process.argv[i];
    const chainIdPrefix = process.env.TENDERLY_SKIP_CHAINID_PREFIX ? "" : (process.env.TENDERLY_CHAINID_PREFIX || "7357");
    const chainId = Number.parseInt(`${chainIdPrefix}${networkId}`);
    const networkName = networks.filter((network: any) => network.id == networkId).map((network: any) => network.slug.replace("-", "_"))[0];
    console.log("Net Name", networkName);

    const environmentSlug =
      process.env.ABSOLUTE_SLUG ??
      `${environmentName}--${networkName.toLowerCase().replace(" ", "-")}--${GIT_REF_NAME!.replace("/", "-")}--${GIT_SHA}`;

    const url = await createTestnet(Number.parseInt(networkId), chainId, environmentSlug);

    console.log("Created a testnet", url);
    chains[`virtual_${networkName}`] = {
      url: url,
      chainId,
      currency: "VIRT",
    };
  }


  if (!existsSync("environments")) {
    mkdirSync("environments");
  }
  writeFileSync("environments/" + environmentName + ".json", JSON.stringify(chains, null, 2));
}

checkEnvAndArgs().then(
  main,
);