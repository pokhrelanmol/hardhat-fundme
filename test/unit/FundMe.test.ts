import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { Signer } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { endianness } from "os";
import { developmentChains } from "../../helper-hardhat-config";
// import { beforeEach } from "mocha";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe: FundMe;
          let deployer: SignerWithAddress;
          let mockV3Aggregator: MockV3Aggregator;
          let accounts: SignerWithAddress[];
          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]); // run all the scripts in deploy folder note: possible bcoz of hardhat-deploy plugin
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });
          describe("constructor", async () => {
              it("set the aggregator address correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });
          describe("fund", async () => {
              it("should revert if less than 50 dollar eth is sent", async () => {
                  /**
                   * @notice not sending any eth so it will revert
                   */
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("update the amount funded data structure", async () => {
                  await fundMe.fund({
                      value: ethers.utils.parseEther("1"),
                  });
                  const res = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  );
                  assert.equal(
                      res.toString(),
                      ethers.utils.parseEther("1").toString()
                  );
              });
              it("should update the getFunders array", async () => {
                  await fundMe.fund({
                      value: ethers.utils.parseEther("1"),
                  });
                  const res = await fundMe.getFunder(0);
                  assert.equal(res, deployer.address);
              });
          });
          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({
                      value: ethers.utils.parseEther("1"),
                  });
              });
              it("should revert if not owner", async () => {
                  await expect(
                      fundMe.connect(accounts[1]).withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });

              it("Withdrawl eth from a single founder", async () => {
                  // Arrange
                  const startingContractbalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  // Act
                  const txRes = await fundMe.withdraw();
                  const txReceipt = await txRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  // gas used
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  // cheaper withdrawl
                  // ASSERT
                  assert(endingContractBalance.toString(), "0");
                  assert.equal(
                      startingContractbalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString()
                  );
              });

              it("CheaperWithdrawl eth from a single founder", async () => {
                  // Arrange
                  const startingContractbalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  // Act
                  const txRes = await fundMe.cheaperWithdraw();
                  const txReceipt = await txRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  // gas used
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  // ASSERT
                  assert(endingContractBalance.toString(), "0");
                  assert.equal(
                      startingContractbalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString()
                  );
              });

              it("should allow us to withdraw with multiple funders", async () => {
                  for (let i = 1; i < 5; i++) {
                      await fundMe.connect(accounts[i]).fund({
                          value: ethers.utils.parseEther("1"),
                      });
                  }

                  const startingContractbalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  const txRes = await fundMe.withdraw();
                  const txReceipt = await txRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  // gas used
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer.address
                  );

                  assert(endingContractBalance.toString(), "0"); //contract balance should be 0
                  assert.equal(
                      startingContractbalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString()
                  );
              });

              it("should reset getFunders Array and mapping", async () => {
                  const txRes = await fundMe.withdraw();
                  const txReceipt = await txRes.wait(1);

                  // checking if getFunders array is empty by providing index, i m expecting the value as 0 in 0th index but empty array will return
                  // error in solidity so it is not possible to check like this instead we can create a getLength function in contract and check the length of array

                  await expect(fundMe.getFunder(0)).to.be.reverted; // this works for checking if array is empty

                  for (let i = 1; i < 5; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          "0"
                      );
                  }
              });
          });
      });
