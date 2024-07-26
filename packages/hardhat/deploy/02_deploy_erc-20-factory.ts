import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { tenderlyFund } from "../scripts/tenderly-fund";
import { Contract, EventLog, parseEther, Wallet } from "ethers";
import { ERC20TokenFactory } from "../typechain-types";
import { tenderly } from "hardhat";

const deployErc20TokenFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await tenderlyFund(deployer);

  await deploy("ERC20TokenFactory", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    gasLimit: 8000000,
  });
  const tokenFactory = await hre.ethers.getContract<ERC20TokenFactory>("ERC20TokenFactory", deployer);
  const tok = await tokenFactory.createToken("Test", "TST", parseEther("100000000000000000000000000000000"));
  const receipt = await tok.wait();

  const tstToken = (receipt!.logs.filter((log: any) => log.fragment?.name === "TokenCreated")[0] as EventLog).args[0];
  console.log("Sending....");

  const erc20Token = new Contract(
    tstToken,
    ["function transfer(address to, uint amount) returns (bool)"],
    (await hre.ethers.getSigners())[0],
  );

  console.log("Sending");

  await Promise.all([
    erc20Token.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    erc20Token.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    erc20Token.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
  ]);

  await tenderly.verify({
    name: "ERC20Token",
    address: tstToken,
  });
};

export default deployErc20TokenFactory;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployErc20TokenFactory.tags = ["Erc20TokenFactory"];
