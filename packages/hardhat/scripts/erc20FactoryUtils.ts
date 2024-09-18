import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ERC20TokenFactory } from "../typechain-types";
import { Contract, EventLog, parseEther } from "ethers";
import { tenderly } from "hardhat";

export async function createToken(
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  tokenName: string,
  tokenSymbol: string,
) {
  const tokenFactory = await hre.ethers.getContract<ERC20TokenFactory>("ERC20TokenFactory", deployer);
  const tok = await tokenFactory.createToken(tokenName, tokenSymbol, parseEther("100000000000000000000000000000000"));
  const receipt = await tok.wait();

  const tstTokenAddress = (receipt!.logs.filter((log: any) => log.fragment?.name === "TokenCreated")[0] as EventLog)
    .args[0];
  console.log(`Deployed test token ${tokenName} ${tokenSymbol}`);

  await tenderly.verify({
    name: "ERC20Token",
    address: tstTokenAddress,
  });

  return new Contract(
    tstTokenAddress,
    [
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    (await hre.ethers.getSigners())[0],
  );
}
