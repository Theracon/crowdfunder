/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
// @ts-nocheck

const { ethers, getNamedAccounts, network } = require("hardhat")
const { assert } = require("chai")
const { devChains } = require("../../helper-hardhat-config")

devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe
      let deployer
      const fundValue = ethers.utils.parseUnits("0.1", "ether")

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("Should allow funding and withdrawal", async function () {
        await fundMe.fund({ value: fundValue })
        await fundMe.withdraw()
        const contractBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(contractBalance.toString(), "0")
      })
    })
