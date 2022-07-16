const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    // symbol 'AS_sym' added 
    await instance.createStar('Awesome Star!','AS1', tokenId, {from: accounts[0]});
    // instance.tokenIdToStarInfo is the mapping (uint256 => Star)
    // because Star is now a struct we get 2 values back
    const result = await instance.tokenIdToStarInfo.call(tokenId);
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
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    console.log("starPrice:", starPrice, typeof(starPrice)); // expect a string
    // starPrice is string
    // result2 below is a BN-Object (BigNumber)
    // assert fails
    
    await instance.createStar1('awesome star', starId, {from: user1});
    const result1 = await instance.tokenIdToStarInfo.call(starId);
    console.log("myResult.createStar1:", result1);

    console.log("calling BN:");
    console.log("w3.version:", web3.version);
    let starPriceBN = web3.utils.BN(starPrice);
    console.log("starPriceBN:", starPriceBN);
    
    console.log("calling putStarUpForSale:");
    let ret = await instance.putStarUpForSale(starId, starPriceBN, {from: user1});
    console.log("putStarUpForSale.ret:", ret);
    const result2 = await instance.starsForSale.call(starId);
    if(web3.utils.isBN(result2)) {
        console.log('result2 is BN:');
        result2_str = result2.toString();
        console.log("starsForSale.result2_str:", result2_str, typeof(result2_str));
        console.log("starPrice...............:", starPrice);
        //assert.equal(await instance.starsForSale.call(starId), starPrice);
        assert.equal(result2_str, starPrice);
    } else {
        console.log('result2 is no BN:');
        console.log("starsForSale.result2",result2, typeof(result2));
        assert.equal(await instance.starsForSale.call(starId), starPrice);    
    }
    console.log("final assert:");
    assert.equal("ok","ok");
}).timeout(10000);

it('lets user1 get the funds after the sale', async() => {
    console.log("---###---", 'lets user1 get the funds after the sale');
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar1('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    console.log("final assert (get funds after sale):");
    assert.equal(value1, value2);
}).timeout(10000);

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar1('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
}).timeout(10000);

it('lets user2 buy a star and decreases its balance in ether', async() => {
    console.log("step_1_inside_buy_and_decrease:");
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    console.log("step_2_create_star_buy_and_decrease:");
    await instance.createStar1('awesome star', starId, {from: user1});
    console.log("step_2_put_star_for_sale_buy_and_decrease:");
    console.log("starId   :" , starId    , typeof(starId));
    console.log("starPrice:" , starPrice , typeof(starPrice));
    let tx1 = await instance.putStarUpForSale(starId, starPrice, {from: user1});
    console.log("ret:", tx1);
    // td next line buggy: user 1 but value is not used.
    //let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    
    //let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    console.log("step_3_buy_star_for_sale_buy_and_decrease:");
    //td Gas-Price must be a string: "0" ("0" is not working for me)
    //td so i test maybe with "1", "1" is not working for me
    //td so i test with
    console.log("starId", starId, typeof(starId));
    console.log("balance", balance, typeof(balance));
    let ret = await instance.buyStar(starId, {from: user2, value: balance, gasPrice:"10000"});

    console.log("step_3a_bought_star_for_sale_buy_and_decrease.ret:", ret);
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    console.log("step_4_calc_diff");
    //td Javascript Number type is dangerous to use and wrong here: 
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    console.log("value:", value);
    console.log("balanceOfUser2BeforeTransaction:", balanceOfUser2BeforeTransaction, typeof(balanceOfUser2BeforeTransaction));
    console.log("balanceAfterUser2BuysStar      :", balanceAfterUser2BuysStar, typeof(balanceAfterUser2BuysStar));
    console.log("calc with BN:");
    let beforeVal = web3.utils.toBN(balanceOfUser2BeforeTransaction);
    let afterVal  = web3.utils.toBN(balanceAfterUser2BuysStar);
    console.log("beforeVal:",beforeVal.toString());
    console.log("afterVal :",afterVal.toString() );
    let diff = beforeVal.sub(afterVal);
    console.log("diff:", diff.toString(), typeof(diff));
    console.log("starprice:", starPrice, typeof(starPrice));
    console.log("final assert (buy and decrease):");
    //td BigInt test
    let before_bi    = BigInt(balanceOfUser2BeforeTransaction);
    let after_bi     = BigInt(balanceAfterUser2BuysStar)
    let diff_bi      = before_bi - after_bi;
    let starPrice_bi = BigInt(starPrice);
    let gasUsed_bi   = BigInt(ret.receipt.gasUsed);
    let effGasPrice  = BigInt(ret.receipt.effectiveGasPrice);

    console.log("BigInt-Calculation");
    console.log("before_bi    :" , before_bi   );
    console.log("after_bi     :" , after_bi    );
    console.log("diff_bi      :" , diff_bi     );
    console.log("starPrice_bi :" , starPrice_bi);
    console.log("gasUsed_bi   :" , gasUsed_bi  );
    console.log("effGasPrice  :" , effGasPrice );

    let gasCosts_bi = gasUsed_bi * effGasPrice;
    console.log("gasCosts     :" , gasCosts_bi ); 

    console.log("final assert: diff == starPrice + gasCosts:");
    assert( diff_bi == starPrice_bi + gasCosts_bi );

}).timeout(15000);

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let tokenId = 101;
    await instance.createStar('My-Star-101','S101', tokenId, {from: accounts[0]});
    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const result = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal( result.name , 'My-Star-101' );
    assert.equal( result.symbol, 'S101');
});

it('lets 2 users exchange stars', async() => {
    
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let token10 = 10;
    let token20 = 20;
    // 1. create 2 Stars with different tokenId
    await instance.createStar('My-Star-10','S10', token10, {from: user1});
    await instance.createStar('My-Star-20','S20', token20, {from: user2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(token10,token20,{from: user2});
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(token10), user2);
    assert.equal(await instance.ownerOf.call(token20), user1);

}).timeout(10000);

it('lets a user transfer a star', async() => {
    
    let instance = await StarNotary.deployed();
    let token30 = 30;
    let user1 = accounts[1];
    let user2 = accounts[2];

    // 1. create a Star with different tokenId
    await instance.createStar('My-Star-30','S30', token30, {from: user1});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, token30, {from: user1} );
    // 3. Verify the star owner changed.
    // 
    let ownerOfStar30 = await instance.ownerOf.call(token30);
    assert.equal(ownerOfStar30, user2);

}).timeout(5000);

it('lookUptokenIdToStarInfo test', async() => {

    let instance = await StarNotary.deployed();

    let contrName = await instance.name.call();
    console.log("contrName:", contrName);

    let versHint = await instance.myVersionHint.call();
    console.log("myVersionHint:", versHint, typeof(versHint));
    let versHint_str = versHint.toString();
    console.log("versHint_str:", versHint_str, typeof(versHint_str));

    let token40 = 40;
    let user3 = accounts[1];

    // 1. create a Star with different tokenId
    await instance.createStar('My-Star-40','S40', token40, {from: user3});
    // 2. Call your method lookUptokenIdToStarInf
    let ret = await instance.lookUptokenIdToStarInfo.call(token40);
    console.log("lookUptokenIdToStarInfo.ret:",ret);
    /* output is:
     lookUptokenIdToStarInfo.ret: [ 'My-Star-40', 'S40', name: 'My-Star-40', symbol: 'S40' ]
     */
    // 3. Verify if you Star name is the same
    assert.equal(ret.name, 'My-Star-40');

}).timeout(5000);

/* overall result:
    9 passing (21s)

    solved problems:
    - .timeout()   added. many of the cases run longer than 2s
    - gasprice 0 did not work here: 
      Workaround: set gasprice to a value, calculate gasCosts, use gasCosts in assert calculation
    - Number NOT a suitable data type. (wrong code in uda's example)
      did tests with BN and BigInt.  Would prefer JS-native BigInt
*/