require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: process.env.RPC_URL, // RPC URL for AMOY testnet
      accounts: [`0x${process.env.PRIVATE_KEY}`], // Your private key
    },
  },
};