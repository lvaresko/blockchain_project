// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./InterfaceMdNFT.sol";

contract MdAuction is Ownable, IERC721Receiver {
    enum AuctionState {
        OPENED, 
        EXPIRED,
        CLOSED
    } 

    struct Auction {
        uint nftId;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
    }
    mapping (uint256 => Auction) public auctions;

    uint256 public auctionLength; 
    IERC20 standartToken;
    InterfaceMdNFT standardNFT;
    mapping (address => uint256) tokenBalances;
    uint256 public durationAuction = 20 * 60; 
    uint256 balances;
    uint256 public entranceFee = 5 * 10**12; 
    AuctionState public contractState;

    constructor(address _token, address _nft) {
        standartToken = IERC20(_token);
        standardNFT = InterfaceMdNFT(_nft);
    }

    event newAuctionOpened(uint256 nftId, uint256 startTime, uint256 endTime);
    event newAuctionClosed(uint256 nftId, address newOwner, uint256 finalPrice);
    event newPlacedBid(uint256 nftId, address bidder, uint256 bidPrice);

    receive() external payable {
        balances = balances + msg.value;
    }

    fallback() external payable {
        balances = balances + msg.value;
    }

    function setStandardToken(address _token) public onlyOwner {
        standartToken = IERC20(_token);
    }

    function setStandardNFT(address _nft) public onlyOwner {
        standardNFT = InterfaceMdNFT(_nft);
    }

    function getBalances() public view onlyOwner returns(uint256) {
        return balances;
    }
    
    function openAuction(string memory _uri) public onlyOwner {
        require(checkStatus() == uint8(AuctionState.CLOSED), "MDAuction: Auction state must be closed to open a new session");
        uint nftId = standardNFT.mintValidTarget(address(this), _uri);

        auctions[auctionLength] = Auction(
            nftId,
            block.timestamp,
            block.timestamp + durationAuction,
            0,
            address(this)
        );

        auctionLength += 1; 
        contractState = AuctionState.OPENED;
        emit newAuctionOpened(nftId, auctions[auctionLength - 1].startTime, auctions[auctionLength - 1].endTime);
    }

    function closeAuction() public onlyOwner {
        require (checkStatus() == uint8(AuctionState.EXPIRED), "MdAuction: The session is not expired");

        if (auctions[auctionLength - 1].highestBid > 0) {
            standardNFT.safeTransferFrom(address(this), auctions[auctionLength - 1].highestBidder, auctions[auctionLength - 1].nftId);
        } else {
            standardNFT.burn(auctions[auctionLength - 1].nftId);
        }
        
        contractState = AuctionState.CLOSED;
        emit newAuctionClosed(auctions[auctionLength - 1].nftId , auctions[auctionLength - 1].highestBidder, auctions[auctionLength - 1].highestBid);
    }

    function placeBid(uint256 _amount) public payable {
        require(checkStatus() == uint8(AuctionState.OPENED), "MdAuction: You can place a bid when the auction is opened");
        require(msg.value >= entranceFee, "MdAuction: You have to put more than 0.000005 eth");
        require(_amount > auctions[auctionLength - 1].highestBid, "MdAuction: You have to bid more than the current bid"); // the person who wants to participate needs to put more than the current bid

        balances += msg.value;

        uint256 allowance = standartToken.allowance(msg.sender, address(this));
        require(allowance >= _amount, "MdAuction: MdToken Overallowance");

        bool success = standartToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "MdAuction: Failed to transfer Md Token");

        if(auctions[auctionLength - 1].highestBid > 0) {
            success = standartToken.transfer(auctions[auctionLength - 1].highestBidder, auctions[auctionLength - 1].highestBid);
            require(success, "MdAuction: Can't transfer to previous bidder");
        }

        auctions[auctionLength - 1].highestBid = _amount;
        auctions[auctionLength - 1].highestBidder = msg.sender;
        emit newPlacedBid(auctions[auctionLength - 1].nftId, auctions[auctionLength - 1].highestBidder, auctions[auctionLength - 1].highestBid);
    }

    function checkStatus() public view returns (uint8) {
        if (auctionLength == 0) {
            return uint8(AuctionState.CLOSED);
        } else if (
            block.timestamp > auctions[auctionLength - 1].endTime &&
            contractState == AuctionState.OPENED
        ) {
            return uint8(AuctionState.EXPIRED);
        } else {
            return uint8(contractState);
        }
    }

    // TEST
    function changeState(uint8 _state) public onlyOwner {
        if(_state == 0) contractState = AuctionState.OPENED;
        else if(_state == 1) contractState = AuctionState.EXPIRED;
        else contractState = AuctionState.CLOSED;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}