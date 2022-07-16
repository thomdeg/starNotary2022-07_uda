## starNotary2022-07_uda

### Contract in rinkeby
    
    ERC-721 Token Name:   "StarNotary22c"
    ERC-721 Token Symbol: "SNO2"
    StarNotary deployed to address: 0xc9928DaFc826DE3aE45c9d87CE874eeff13b1225

### Truffle Version

    $ truffle version
    Truffle v5.5.20 (core: 5.5.20)
    Ganache v7.2.0
    Solidity - pragma (solc-js)
    Node v16.15.1
    Web3.js v1.7.4

### openzeppelin

    "version": "4.7.0"

    This version requires solidity version 0.8.9 in my setup.

### webpack trouble

When I started with the ./app I installed webpack 5.73 at first
and downgraded later to webpack 4.46 which run without too much work.
Because things did not work as expected I tried installations with and without the -g option.

The trouble shooting with webpack installations lead to difficulties with the truffle installation probably. Because the tests with truffle were all successful I did not repair the truffle installation. Instead I installed HardHat to perform the deployment of the contract.

### truffle notes
I found example code in Uda's TestNotary.js that used the Number data type for calculating with ether. These calculations failed in the test setup.

### the app

The final version of the app in the repo contains the rinkeby address of the smart contract. The final tests with chrome/metamask on rinkeby were successful.

### the orig readme.md

the orig readme is : README_from_uda.md

