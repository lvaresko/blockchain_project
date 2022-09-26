const { ethers } = require("ethers");
const { createMetadataJson } = require("./metadata");
const { getSigner } = require("./signer");
const dotenv = require('dotenv').config({ path: "./src/.env" });

const handleAuctionOpen = async () => {
    try {
        const signer = getSigner();
        const nftContract = new ethers.Contract(process.env.NFT_ADDRESS, process.env.NFT_ABI, signer);
        const totalsupply = await nftContract.totalSupply();
        let uri;

        if (parseInt(totalsupply) == 0) {
            uri = await createMetadataJson(0);
        } else {
            const lastNft = await nftContract.tokenByIndex(parseInt(totalsupply - 1));
            const newNft = parseInt(lastNft) + 1;
            uri = await createMetadataJson(newNft);
        }

        console.log("JSON CREATED");

        const auctionContract = new ethers.Contract(process.env.AUCTION_ADDRESS, process.env.AUCTION_ABI, signer);
        const tx = await auctionContract.openAuction(uri);
        await tx.wait();
    }
    catch (error) {
        console.log(error);
    }
};

const handleAuctionClose = async () => {
    try {
        const signer = getSigner();
        const auctionContract = new ethers.Contract(process.env.AUCTION_ADDRESS, process.env.AUCTION_ABI, signer);
        const tx = await auctionContract.closeAuction();
        await tx.wait();
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    handleAuctionOpen,
    handleAuctionClose
}