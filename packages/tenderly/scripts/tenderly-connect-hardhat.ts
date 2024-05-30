import * as fs from "fs";

(async function main() {
  fs.cpSync("tenderly.config.ts", "../hardhat/tenderly.config.ts");
})();
