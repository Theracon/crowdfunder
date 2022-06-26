/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
// @ts-nocheck

const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe
      let deployer
      let mockV3Aggregator
      const fundValue = ethers.utils.parseUnits("0.1", "ether")

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async function () {
        it("Should set the current contract owner", async function () {
          const response = await fundMe.getOwner()
          assert.equal(response, deployer)
        })
        it("Should set the price feed with the correct address", async function () {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async function () {
        it("Should fail if insufficient ETH is sent", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "Amount sent is too little."
          )
        })
        it("Should include sender in address to amount mapping", async function () {
          await fundMe.fund({ value: fundValue })
          const amount = await fundMe.getAmountByAccount(deployer)
          assert.equal(amount.toString(), fundValue.toString())
        })
        it("Should add funder to funders array", async function () {
          await fundMe.fund({ value: fundValue })
          const funder = await fundMe.getFunder(0)
          assert.equal(funder, deployer)
        })
      })

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: fundValue })
        })

        it("Should allow withdrawal with a single founder", async function () {
          const initialContractBalace = await fundMe.provider.getBalance(
            fundMe.address
          )
          const initialDeployerBalace = await fundMe.provider.getBalance(
            deployer
          )
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const finalContractBalace = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalace = await fundMe.provider.getBalance(deployer)

          assert.equal(finalContractBalace, 0)
          assert.equal(
            initialContractBalace.add(initialDeployerBalace).toString(),
            finalDeployerBalace.add(gasCost).toString()
          )
        })
        it("Should allow withdrawal with multiple funders", async function () {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < accounts.length; i++) {
            const connectedAccount = await fundMe.connect(accounts[i])
            await connectedAccount.fund({ value: fundValue })
          }
          const initialContractBalace = await fundMe.provider.getBalance(
            fundMe.address
          )
          const initialDeployerBalace = await fundMe.provider.getBalance(
            deployer
          )
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const finalContractBalace = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalace = await fundMe.provider.getBalance(deployer)
          assert.equal(finalContractBalace, 0)
          assert.equal(
            initialContractBalace.add(initialDeployerBalace).toString(),
            finalDeployerBalace.add(gasCost).toString()
          )
          for (let i = 0; i < accounts.length; i++) {
            assert(fundMe.getAmountByAccount(accounts[i.address]), 0)
          }
          await expect(fundMe.getFunder(0)).to.be.reverted
        })
        it("Should block non-owner from withdrawing funds", async function () {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const connectedAccount = await fundMe.connect(attacker)
          await expect(connectedAccount.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          )
        })
      })
    })
