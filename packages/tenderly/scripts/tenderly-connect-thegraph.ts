import * as fs from "fs";

(async function main() {
  fs.cpSync("tenderly.config.ts", "../thegraph/tenderly.config.ts");
})();
