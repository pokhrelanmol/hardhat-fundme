import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    DECIMALS,
    developmentChains,
    INITIAL_ANSWER,
    networkConfig,
} from "../helper-hardhat-config";

// mocks contracts is a minimal version of contract
const deployMocks = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}: HardhatRuntimeEnvironment) => {
    const { deployer } = await getNamedAccounts();
    const networkName = network.name as string;
    if (developmentChains.includes(networkName)) {
        const { deploy, log } = deployments;
        log("local network detected, deploying mocks...");
        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        });
        log("mocks deployed...");
        log("-----------------------");
    }
};
// only run this mock deploy script
export default deployMocks;
deployMocks.tags = ["all", "mocks"];
// run hh deploy --tags mocks to deploy this script
