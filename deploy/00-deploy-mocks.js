/* eslint-disable prettier/prettier */
// eslint-disable-next-line node/no-unpublished-require
const { network } = require("hardhat")
const {
  devChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (devChains.includes(network.name)) {
    log("Local Network Detected. Deploying Mocks...")

    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    })

    log("Mocks Deployed.")
    log("--------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
