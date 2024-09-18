import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { tenderlyFund } from "../scripts/tenderly-fund";
import { parseEther, Wallet } from "ethers";
import { SimpleAMM } from "../typechain-types";
import { createToken } from "../scripts/erc20FactoryUtils";

const deployErc20TokenFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await tenderlyFund(deployer);

  const buzToken = await createToken(hre, deployer, "Buz Token", "BUZ");
  const bazToken = await createToken(hre, deployer, "Baz Token", "BAZ");

  await deploy("SimpleAMM", {
    from: deployer,
    // Contract constructor arguments
    args: [await buzToken.getAddress(), await buzToken.getAddress()],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    gasLimit: 8000000,
  });

  const liquidityProvider = Wallet.createRandom(hre.ethers.provider);
  await tenderlyFund(liquidityProvider.address);

  const simpleAmm = await hre.ethers.getContract<SimpleAMM>("SimpleAMM", liquidityProvider);
  const buzLP = await hre.ethers.getContractAt("ERC20Token", await buzToken.getAddress(), liquidityProvider);
  const bazLP = await hre.ethers.getContractAt("ERC20Token", await bazToken.getAddress(), liquidityProvider);

  console.log({ deployer, liquidityProvider: liquidityProvider.address });

  await buzToken.transfer(liquidityProvider.address, parseEther("100000000000000"));
  await bazToken.transfer(liquidityProvider.address, parseEther("100000000000000"));
  await buzLP.approve(await simpleAmm.getAddress(), parseEther("100000000000000"));
  await bazLP.approve(await simpleAmm.getAddress(), parseEther("100000000000000"));

  await simpleAmm.addLiquidity(BigInt("10000000"), BigInt("10000000"));
};

export default deployErc20TokenFactory;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployErc20TokenFactory.tags = ["SimpleAMM"];
