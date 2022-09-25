// const deployFunc = () => {
//     console.log("running deployemnt");
// };
// export default deployFunc;

import { network } from "hardhat";
import { HardhatRuntimeEnvironment, NetworkConfig } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import "dotenv/config";
import { verify } from "../utils/verify";
/////// Or use the following snippet to deploy a contract with hardhat-deploy ///////
enum CHAIN_ID {
    GEORLI = 5,
    POLYGON = 137,
}

const deployFundMe = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const MockV3Aggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = MockV3Aggregator.address;
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[CHAIN_ID.GEORLI].ethUsdPriceFeedAddress;
    }

    // we are using chainlink aggregatorV3 for price feed and that is only available on mainnet, and live testnets (rinkeby, goerli, kovan, ropsten). So how to test on hardhat network locally?
    // To solve this problem we are using  something call mockups for chainlink aggregatorV3.

    const args: string[] = ([ethUsdPriceFeedAddress] as unknown) as string[];
    const chainId = network.config.chainId!;
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        // waitConfirmations: networkConfig[chainId].blockConfirmations, // this gives error
        waitConfirmations: 1,
    });
    if (!developmentChains.includes(network.name)) {
        // use this to verify contract on etherscan
        await verify(fundMe.address, (args as unknown) as [string]);
    }
    log("all deployements done.............");
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"];
