// HardHat defaults:
const { expect , assert } = require("chai");
const hre = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

//const StarNotary = artifacts.require("StarNotary");

//var accounts;
//var owner;

/* contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});
 */

describe('my StarNotary', function() {

    let StarNotary;
    let instance;
    const oneEther_in_wei = ethers.constants.WeiPerEther.toBigInt();
    
    before(async function() {
        console.log("before all tests...");
        StarNotary = await ethers.getContractFactory("StarNotary");
        instance   = await StarNotary.deploy();  // calls constructor
        console.log("instance.address:", instance.address);
        console.log("contract deployed");
    });

    it('can Create a Star', async() => {
    
        let tokenId = 1;
    
        //await instance.createStar('Awesome Star!','AS1', tokenId, {from: accounts[0]});
        console.log("creating star...");
        let tx1 = await instance.createStar('Awesome Star!','AS1', tokenId);
        tx1.wait();
        //console.log("star created:", tx1);
        
        // instance.tokenIdToStarInfo is the mapping (uint256 => Star)
        // because Star is now a struct we get 2 values back
        const result = await instance.tokenIdToStarInfo(tokenId);
        console.log("myResult:", result);
        /* prints this:
            myResult: Result {
            '0': 'Awesome Star!',
            '1': 'AS1',
            name: 'Awesome Star!',
            symbol: 'AS1'
        } */
        //assert.equal( await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
        assert.equal( result.name, "Awesome Star!");
        assert.equal( result.symbol, "AS1");
    });
    
    it('lets user1 put up their star for sale', async() => {
            
        console.log("---###---", 'lets user1 put up their star for sale:');
        
        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);
        let starId = 2;
        //let starPrice = web3.utils.toWei(".01", "ether");
        // see: https://www.investopedia.com/terms/w/wei.asp
        
        // 0.01 ether is oneEther / 100
        
        let starPrice = oneEther_in_wei / 100n;
        console.log("starPrice:", starPrice, typeof(starPrice));   // expect BigInt
    
        // result2 below is a BN-Object (BigNumber)
        // assert fails
        
        await instance.createStar1('awesome star', starId );
        const result1 = await instance.tokenIdToStarInfo(starId);
        console.log("myResult.createStar1:", result1);
    
        //console.log("calling BN:");
        //console.log("w3.version:", web3.version);
        //let starPriceBN = web3.utils.BN(starPrice);
        //console.log("starPriceBN:", starPriceBN);
        
        console.log("calling putStarUpForSale:");
        let ret = await instance.putStarUpForSale( starId, starPrice );
        //console.log("putStarUpForSale.ret:", ret);
        const result2 = await instance.starsForSale(starId);
        console.log("result2:", result2, typeof(result2));
    
        console.log("final assert:");
        assert.equal(result2.toBigInt(),starPrice);
    }).timeout(10000);
    
    it('lets user1 get the funds after the sale', async() => {

        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);

        console.log("---###---", 'lets user1 get the funds after the sale');
        let starId = 3;
        //let starPrice = web3.utils.toWei(".01", "ether");
        let starPrice = oneEther_in_wei / 100n ;
        console.log("starPrice:", starPrice, typeof(starPrice));

        //let balance = web3.utils.toWei(".05", "ether");
        let balance = oneEther_in_wei * 5n / 100n;
        console.log("balance  :", balance, typeof(balance));

        await instance.createStar1('awesome star', starId );
        await instance.putStarUpForSale(starId, starPrice );
        //let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        let balanceOfUser1BeforeTransaction = await user1.getBalance();
        let instance_user2 = instance.connect(user2);
        await instance_user2.buyStar(starId, {value: balance});
        let balanceOfUser1AfterTransaction = await user1.getBalance();
        let value1 = balanceOfUser1BeforeTransaction.toBigInt() + starPrice;
        let value2 = balanceOfUser1AfterTransaction.toBigInt();
        console.log("balanceOfUser1BeforeTransaction:", balanceOfUser1BeforeTransaction.toBigInt());
        console.log("balanceOfUser1AfterTransaction :", balanceOfUser1AfterTransaction .toBigInt());
        console.log("final assert (get funds after sale):");
        assert.equal(value1, value2);
    }).timeout(10000);
        
    it('lets user2 buy a star, if it is put up for sale', async() => {
        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);

        let starId = 4;
        //let starPrice = web3.utils.toWei(".01", "ether");
        //let balance = web3.utils.toWei(".05", "ether");
        let starPrice = oneEther_in_wei / 100n ;
        let balance = oneEther_in_wei * 5n / 100n;
        console.log("starPrice:", starPrice, typeof(starPrice));
        console.log("balance  :", balance, typeof(balance));

        let tx1 = await instance.createStar1('awesome star4', starId );
        tx1.wait();
        let tx2 = await instance.putStarUpForSale(starId, starPrice );
        tx2.wait();
        //let balanceOfUser1BeforeTransaction = await user2.getBalance();
        let instance_user2 = instance.connect(user2);
        await instance_user2.buyStar(starId, {value: balance});
        assert.equal(await instance.ownerOf(starId), user2.address);
    }).timeout(10000);


    it('lets user2 buy a star and decreases its balance in ether', async() => {
        console.log("step_1_inside_buy_and_decrease:");
        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);

        let starId = 5;

        let starPrice = oneEther_in_wei / 100n ;
        let balance = oneEther_in_wei * 5n / 100n;
        console.log("starPrice:", starPrice, typeof(starPrice));
        console.log("balance  :", balance, typeof(balance));

        console.log("step_2_create_star_buy_and_decrease:");
        await instance.createStar1('awesome star5', starId);
        console.log("step_2_put_star_for_sale_buy_and_decrease:");
        console.log("starId   :" , starId    , typeof(starId));
        console.log("starPrice:" , starPrice , typeof(starPrice));
        await instance.putStarUpForSale(starId, starPrice);
        // td next line buggy: user 1 but value is not used.
        //let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        
        const balanceOfUser2BeforeTransaction = await user2.getBalance();
        console.log("step_3_buy_star_for_sale_buy_and_decrease:");
        //td Gas-Price must be a string: "0" ("0" is not working for me)
        //td so i test maybe with "1", "1" is not working for me
        //td so i test with
        //td there was a lot of trouble with the gas price on truffle
        //td lets see here with hardhat:

        let instance_user2 = instance.connect(user2);
        //let ret = await instance_user2.buyStar(starId, {from: user2, value: balance, gasPrice:10000});
        let txBuy = await instance_user2.buyStar(starId, {value: balance /*, gasPrice:10000*/ });
    
        console.log("step_3a_bought_star_for_sale_buy_and_decrease.txBuy:", txBuy);
        const balanceAfterUser2BuysStar = await user2.getBalance();
        console.log("step_4_calc_diff");
        //td Javascript Number type is dangerous to use and wrong here: (Uda's code)
        //let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        console.log("balanceOfUser2BeforeTransaction:", balanceOfUser2BeforeTransaction, typeof(balanceOfUser2BeforeTransaction));
        console.log("balanceAfterUser2BuysStar      :", balanceAfterUser2BuysStar, typeof(balanceAfterUser2BuysStar));
        console.log("calc with BigInt:");
        let beforeVal = balanceOfUser2BeforeTransaction.toBigInt();
        let afterVal  = balanceAfterUser2BuysStar.toBigInt();
        console.log("beforeVal: ", beforeVal );
        console.log("afterVal : ", afterVal  );
        let diff = beforeVal - afterVal;
        console.log("diff:", diff );
        console.log("starprice:", starPrice, typeof(starPrice));
        console.log("final assert (buy and decrease):");
        //td BigInt test

        // transaction receipt:
        console.log("waiting for receipt:");
        let txRe = await txBuy.wait();

        let gasUsed      = txRe.gasUsed.toBigInt();
        let effGasPrice  = txRe.effectiveGasPrice.toBigInt();
    
        console.log("gasUsed     :" , gasUsed  );
        console.log("effGasPrice :" , effGasPrice );
    
        let gasCosts = gasUsed * effGasPrice;
        console.log("gasCosts    :" , gasCosts ); 
    
        console.log("final assert: diff == starPrice + gasCosts:");
        assert( diff == starPrice + gasCosts );
    
    }).timeout(15000);
    
    // Implement Task 2 Add supporting unit tests

    it('can add the star name and star symbol properly', async() => {
        
        // 1. create a Star with different tokenId
        let tokenId = 101;
        await instance.createStar('My-Star-101','S101', tokenId);
        // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        const result = await instance.tokenIdToStarInfo(tokenId);
        assert.equal( result.name , 'My-Star-101' );
        assert.equal( result.symbol, 'S101');
    });

    it('lets 2 users exchange stars', async() => {
    
        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);

        let token10 = 10;
        let token20 = 20;
        // 1. create 2 Stars with different tokenId
        await instance.createStar('My-Star-10','S10', token10);
        let instance_user2 = instance.connect(user2);
        await instance_user2.createStar('My-Star-20','S20', token20);
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        await instance_user2.exchangeStars(token10,token20);
        // 3. Verify that the owners changed
        assert.equal(await instance.ownerOf(token10), user2.address);
        assert.equal(await instance.ownerOf(token20), user1.address);
    
    }).timeout(10000);
    
    it('lets a user transfer a star', async() => {
    
        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);

        let token30 = 30;
    
        // 1. create a Star with different tokenId
        await instance.createStar('My-Star-30','S30', token30);
        // 2. use the transferStar function implemented in the Smart Contract
        await instance.transferStar(user2.address, token30);
        // 3. Verify the star owner changed.
        // 
        let ownerOfStar30 = await instance.ownerOf(token30);
        assert.equal(ownerOfStar30, user2.address);
    
    }).timeout(5000);

    it('lookUptokenIdToStarInfo test', async() => {

        const [user1 , user2, user3]  = await ethers.getSigners();
        console.log("user1:", /*user1, */ user1.address);
        console.log("user2:", /*user2, */ user2.address);
        console.log("user3:", /*user3, */ user3.address);
    
        let contrName = await instance.name();
        console.log("contrName:", contrName);
    
        let versHint = await instance.myVersionHint();
        console.log("myVersionHint:", versHint, typeof(versHint));
        let versHint_str = versHint.toString();
        console.log("versHint_str:", versHint_str, typeof(versHint_str));
    
        let token40 = 40;
        
        // 1. create a Star with different tokenId
        await instance.connect(user3).createStar('My-Star-40','S40', token40 );
        // 2. Call your method lookUptokenIdToStarInf
        let ret = await instance.lookUptokenIdToStarInfo(token40);
        console.log("lookUptokenIdToStarInfo.ret:",ret);
        /* output is:
         lookUptokenIdToStarInfo.ret: [ 'My-Star-40', 'S40', name: 'My-Star-40', symbol: 'S40' ]
         */
        // 3. Verify if you Star name is the same
        assert.equal(ret.name, 'My-Star-40');
    
    }).timeout(5000);
    
});



/* overall result:
    9 passing (21s)

    solved problems:
    - .timeout()   added. many of the cases run longer than 2s
    - gasprice 0 did not work here: 
      Workaround: set gasprice to a value, calculate gasCosts, use gasCosts in assert calculation
    - Number NOT a suitable data type. (wrong code in uda's example)
      did tests with BN and BigInt.  Would prefer JS-native BigInt
*/