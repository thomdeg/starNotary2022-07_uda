pragma solidity >=0.4.24;


//Importing openzeppelin-solidity ERC-721 implemented Standard
//import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
//td openzeppelin 4.x:  this version needs solidity ^0.8.0
//td truffle config
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
        string symbol;  // star's symbol as required 
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    // 2022-07: openZeppelin 4.x is current 
    // here we have a constructor for this
    constructor() ERC721("StarNotary22c","SNO2") {}

    // mapping the Star with the Owner Address
    // td: the comment above is probably wrong
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct: the old func has 
    function createStar1(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name, ""); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Create Star using the Struct: the struct has a symbol field
    function createStar(string memory _name, string memory _symbol, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name, _symbol); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        //return address(uint160(x)); //td: not working for solc 8
        return payable(x);
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        //td: maybe a problem only owner or approver can call transferFrom
        //_transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        //td: the unsafe variant:
        _transfer(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            //td: payable() necessary for solc 8
            payable(msg.sender).transfer(msg.value - starCost);
            
        }
    }

    function myVersionHint() public pure returns(uint16) {
        return 11;
    } 

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint256 _tokenId) public view returns (Star memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        // td
        //return  tokenIdToStarInfo[_tokenId].name;  // only the name ?
        return  tokenIdToStarInfo[_tokenId];  // or the whole struct ?
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        //4. Use _transferFrom function to exchange the tokens.
        require( ownerOf(_tokenId1) == msg.sender  || ownerOf(_tokenId2) == msg.sender,
            "You can't exchange a star you don't own");
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        //td: in OpenZeppelin ERC721 V4 we have _transfer(from, to, tokenId)
        _transfer(/*from*/ owner1, /*to*/ owner2, _tokenId1);
        _transfer(/*from*/ owner2, /*to*/ owner1, _tokenId2);
        //td: this emits: emit Transfer(from, to, tokenId);  2-times
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        //td: in OpenZeppelin ERC721 V4 we have _transfer(from, to, tokenId)
        //td: or transferFrom
        //td: transferFrom() calls _transfer
        require( ownerOf(_tokenId) == msg.sender  ,
            "You can't transfer a star you don't own");
        address from = ownerOf(_tokenId);
        transferFrom(from, _to1, _tokenId);
        // or:
        //_transfer(from, _to1, _tokenId);
        
        //td: this maybe emits: emit Transfer(from, to, tokenId);  times
    }

}
