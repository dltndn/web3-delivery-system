require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEYS = [
  process.env.PRIVATE_KEY1, // 0x0Ef131b9E75e426e942493647d14022DDf96c89D 
  process.env.PRIVATE_KEY2,  // 0x42eaD1C7b157cC7d46b26D2c0c08D197339d4EDc
  process.env.PRIVATE_KEY3, // 0x20F948bC87157e4a9fF555613c095d3725622499
]

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    wemix_testnet: {
      url: process.env.WEMIX_TESTNET_PROVIDER,
      accounts: PRIVATE_KEYS
    },
  }
};
