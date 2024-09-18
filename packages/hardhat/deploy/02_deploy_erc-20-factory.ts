import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { tenderlyFund } from "../scripts/tenderly-fund";
import { parseEther, Wallet } from "ethers";
import { createToken } from "../scripts/erc20FactoryUtils";

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
  const tokenFoo = await createToken(hre, deployer, "Foo Token", "FOO");
  const tokenTst = await createToken(hre, deployer, "Bar Token", "BAR");

  await Promise.all([
    tokenTst.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    tokenTst.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    tokenTst.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    tokenFoo.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    tokenFoo.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
    tokenFoo.transfer(Wallet.createRandom(hre.ethers.provider), parseEther("100000000")),
  ]);
};

export default deployErc20TokenFactory;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployErc20TokenFactory.tags = ["Erc20TokenFactory"];
