const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MdNFT Testing", () => {
    let owner; // firstAddress
    let secondAddress;
    let addresses;
    let nftContract;

    beforeEach(async () => {
        [owner, secondAddress, ...addresses] = await ethers.getSigners();
        let nftFactory = await ethers.getContractFactory("MdNFT");
        nftContract = await nftFactory.deploy();
    });

    it("Deploy the smart contract successfully, and give it the address", async () => {
        console.log(nftContract.address);
    });

    it("Mint nft successfully", async () => {
        const tx1 = await nftContract.setValidTarget(owner.address, true);
        await tx1.wait();

        const tx2 = await nftContract.mintValidTarget(owner.address, "ipfs://hello");
        await tx2.wait();

        const ownerNfts = await nftContract.balanceOf(owner.address);
        expect(parseInt(ownerNfts)).to.be.eq(1);

        const nftId = await nftContract.tokenOfOwnerByIndex(owner.address, ownerNfts - 1);
        const tokenURI = await nftContract.tokenURI(nftId);
        expect(tokenURI).to.be.eq("ipfs://hello");

    });

    it("Not a valid target, can't call the mintValidTarget function", async () => {
        const tx2 = nftContract.mintValidTarget(owner.address, "ipfs://hello");
        await expect(tx2).to.be.reverted;

    });

    it("Can't mint, overflow the max supply", async () => {
        const tx1 = await nftContract.setValidTarget(owner.address, true);
        await tx1.wait();

        for (let i = 0; i < 1000; i++) {
            const tx2 = nftContract.mintValidTarget(owner.address, "ipfs://hello");
            await tx1.wait();
        }

        const tx2 = nftContract.mintValidTarget(owner.address, "ipfs://hello");
        await expect(tx2).to.be.reverted;
    });
})