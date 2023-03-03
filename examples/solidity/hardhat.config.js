require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require('@nomiclabs/hardhat-truffle5');
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:9545"
    }
  }
};
