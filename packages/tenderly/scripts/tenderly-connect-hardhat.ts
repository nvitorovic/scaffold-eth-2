import * as fs from "fs";
import * as child_process from "child_process";

(async function main() {
  fs.cpSync("tenderly.config.ts", "../hardhat/tenderly.config.ts");
  child_process.execSync("npx prettier ../hardhat/tenderly.config.ts --write");
})();
