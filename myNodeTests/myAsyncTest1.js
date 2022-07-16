
const Web3 = require('web3');

// Contract Descriptions from the build-dir
const starNotaryArtifact = require('../build/contracts/StarNotary.json');

console.log("Hello");

async function main() {
    console.log("Requesting web3");

    let w3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
    //console.log("w3 is:",w3);
    
    const networkId = await w3.eth.net.getId();
    console.log("networkId:", networkId);
    const deployedNetwork = starNotaryArtifact.networks[networkId];
    
    const starContract = new w3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
    
    const accounts = await w3.eth.getAccounts();
    console.log("Accounts:", accounts);
    
    const account0 = accounts[0];
    console.log("account0:", account0);

    //see: https://stackoverflow.com/questions/33798717/javascript-es6-const-with-curly-braces
    let createStar_Func = starContract.methods.createStar;
    let lookUptokenIdToStarInfo_Func = starContract.methods.lookUptokenIdToStarInfo;

    let tokenId_101 = 102;
    let ret1 = await createStar_Func("MyStar1","s1", tokenId_101).send({from: account0});
    console.log("createStarFunc.Ret:", ret1);
    
    let ret2 = await lookUptokenIdToStarInfo_Func(tokenId_101).call({from: account0});
    console.log("lookUptokenIdToStarInfo_Func.call.ret:", ret2);

    //let ret3 = await lookUptokenIdToStarInfo_Func(tokenId_101).send({from: account0});;
    //console.log("lookUptokenIdToStarInfo.Ret:", ret3);

}

(async () => {
    console.log("inside my nameless async func...");
    let ret = await main();
    console.log("ret:", ret);
})();

