const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MdToken Testing", () => {
    let owner; // firstAddress
    let secondAddress;
    let addresses;
    let tokenContract;

    beforeEach(async () => {
        [owner, secondAddress, ...addresses] = await ethers.getSigners();
        let tokenFactory = await ethers.getContractFactory("MdToken");
        tokenContract = await tokenFactory.deploy();
    });

    it("Deploy smart contract successfully, and give it an address", async () => {
        console.log(tokenContract.address);
    });

    it("Show that totalSupply is 10^26 and that is equal to the balanceOf owner", async () => {
        console.log("Owner ", owner);
        const ownerAmount = await tokenContract.balanceOf(owner.address);
        console.log(ownerAmount);

        const totalSupply = await tokenContract.totalSupply();
        expect(ownerAmount).to.be.eql(totalSupply);
    });

    it("When you are minting a token, it will fail if you are different account", async () => {
        const tx = await tokenContract.connect(secondAddress).mint(secondAddress.address, 5000);
        await expect(tx).to.be.reverted;
    })
})