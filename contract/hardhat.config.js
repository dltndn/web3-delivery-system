require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEYS = [
  process.env.PRIVATE_KEY1, // 0x2cC285279f6970d00F84f3034439ab8D29D04d97 
  process.env.PRIVATE_KEY2,  // 0x1e1864802DcF4A0527EF4315Da37D135f6D1B64B
  process.env.PRIVATE_KEY3, // 0x521D5d2d40C80BAe1fec2e75B76EC03eaB82b4E0
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
