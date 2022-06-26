/* eslint-disable node/no-unpublished-require */
/* eslint-disable prettier/prettier */
const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified on Etherscan")
    } else {
      console.log(error)
    }
  }
}

module.exports = { verify }
