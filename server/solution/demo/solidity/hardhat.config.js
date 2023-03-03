require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require('@nomiclabs/hardhat-truffle5');
const { NETWORK_URL } = process.env;
module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "local",
  networks: {
    local: {
      url: NETWORK_URL
    }
  }
};
