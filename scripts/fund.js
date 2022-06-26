// @ts-nocheck
/* eslint-disable prettier/prettier */
/* eslint-disable no-process-exit */

const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)

  console.log("Funding Contract...")

  const txResponse = await fundMe.fund({
    value: ethers.utils.parseUnits("0.1", "ether"),
  })
  await txResponse.wait(1)

  console.log("Contract Funded.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
