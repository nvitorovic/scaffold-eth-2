import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import * as dotenv from "dotenv";
import { mkdirSync } from "fs";

dotenv.config();
console.log(process.env.P);

const chainId = Number.parseInt(`3757${process.argv[3] || 1}`);
const GIT_REF_NAME = process.env.GIT_REF_NAME;
const GIT_SHA = process.env.GITHUB_SHA;

const stageSlug = `${getStageName()}-${GIT_REF_NAME!.replace("/", "-")}-${GIT_SHA}`;

function checkEnv() {
  const missingValues = [
    "NETWORK_ID",
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

checkEnv();

async function createTestnet() {
  const accountId = process.env.TENDERLY_ACCOUNT_ID;
  // Replace with your actual account ID
  const projectSlug = process.env.TENDERLY_PROJECT_ID;

  const apiUrl = `https://api.tenderly.co/api/v1/account/${accountId}/project/${projectSlug}/vnets`;

  try {
    console.log(stageSlug);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": process.env.TENDERLY_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        slug: stageSlug,
        // description: getStageName(),
        fork_config: {
          network_id: Number.parseInt(process.env.NETWORK_ID!),
        },
        virtual_network_config: {
          chain_config: {
            chain_id: chainId,
          },
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
      const data = await response.json();
      // @Dalibor
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


function getStageName() {
  const stageName = process.argv[2];
  if (stageName == "now" || !stageName) {
    return `${Date.now()}`;
  }
  return stageName;
}

// Example usage
async function main() {
  // Get the name parameter from the command line arguments
  const stageName = getStageName();

  const url = await createTestnet();

  if (!existsSync("environments")) {
    mkdirSync("environments");
  }
  writeFileSync("environments/" + stageName + ".json", JSON.stringify({
    [stageName]: {
      url: url,
      chainId,
      currency: "vEth",
    },
  }, null, 2));
}

main();