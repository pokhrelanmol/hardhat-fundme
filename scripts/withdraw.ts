import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";
const main = async () => {
    const deployer = (await getNamedAccounts()).deployer;
    const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
    console.log("withdrawing eth...");
    const txResponse = await fundMe.cheaperWithdraw();
    const txReciept = await txResponse.wait(1);
    console.log("Withdrawl completed...");
};
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
