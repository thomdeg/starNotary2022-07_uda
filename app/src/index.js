import Web3 from "web3";

// -- truffle import
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

// -- hardhat import
import hh_starNotaryArtifact from "../../myHardHat/artifacts/contracts/StarNotary.sol/StarNotary.json";
// HH_localhost:
//const hh_starNotaryArtifact_localAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
// rinkeby:
const hh_starNotaryArtifact_localAddress = "0xc9928DaFc826DE3aE45c9d87CE874eeff13b1225";
const useMyHardHat = true;

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance for hardhat
      if(useMyHardHat) {
        this.meta = new web3.eth.Contract(
          hh_starNotaryArtifact.abi,
          hh_starNotaryArtifact_localAddress,
        );
      } else {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = starNotaryArtifact.networks[networkId];
        this.meta = new web3.eth.Contract(
          starNotaryArtifact.abi,
          deployedNetwork.address,
        );  
        console.info("networkId:", networkId);
        console.info("deployedNetwork.address:", deployedNetwork.address);  
      }

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const sym  = document.getElementById("starSym").value;
    const id = document.getElementById("starId").value;
    await createStar(name,sym, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  setLookupStarInfo: function(msg) {
    const lookupStarInfo = document.getElementById("lookupStarInfo");
    lookupStarInfo.innerHTML = msg;
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo  } = this.meta.methods;
    let contrName = await this.meta.methods.name().call();
    console.info("contract-Name:", contrName); 

    let versHint = await this.meta.methods.myVersionHint().call();
    console.info("Version Hint:", versHint);

    console.info("Address:", this.meta.address);

    const tokenId = document.getElementById("lookid").value;
    console.info("tokenId:", tokenId, typeof(tokenId));
    console.info("lookUptokenIdToStarInfo:", lookUptokenIdToStarInfo);
    console.info("w3.version:",Web3.version);
    // we have '1.7.4', the method.call is: method(parm1). call()
    let ret = await lookUptokenIdToStarInfo(tokenId).call({from: this.account});
    console.info("ret:",ret, typeof(ret));
    App.setLookupStarInfo("Star: " + ret.name + ", Symbol: " + ret.symbol);
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider:
    console.info('MetaMask is installed!');
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});