import { ethers, getNamedAccounts } from "hardhat";
const main = async () => {
    const deployer = (await getNamedAccounts()).deployer;
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding contract....");
    const txResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.05"),
    });
    const txReciept = await txResponse.wait(1);
    console.log("Funded contract with 0.05 ether");
};
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
