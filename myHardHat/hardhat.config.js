require("@nomicfoundation/hardhat-toolbox");

const MySecrets = require("./hardhat_my_secrets.js");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks:{
    rinkeby:{
      url: MySecrets.my_alchemy_url   ,
      accounts: [MySecrets.my_rinkeby_priv] ,
      // 0xeB90F554B5c326dcf3BAcaC185463161960dF70F
    },
  }
};
