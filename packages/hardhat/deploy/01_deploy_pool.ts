import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { tenderlyFund } from "../scripts/tenderly-fund";
import { PoolCreator } from "../typechain-types";

const deployPoolCreator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await tenderlyFund(deployer);

  await deploy("PoolCreator", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    gasLimit: 8000000,
  });
  const poolCreator = await hre.ethers.getContract<PoolCreator>("PoolCreator", deployer);
  await poolCreator.deployPool(
    "0x9af9daa3f7e1156e4a29e1063a2898175d0cd5f0",
    "0x2efab7fe25bc03474f6a340e51a38744a284f8b2",
    100,
  );
};

export default deployPoolCreator;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployPoolCreator.tags = ["PoolCreator"];
