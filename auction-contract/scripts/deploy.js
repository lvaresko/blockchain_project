const hre = require("hardhat");

async function main() {
  const MdNFT = await ethers.getContractFactory("MdNFT");
  const nftContract = await MdNFT.deploy();

  const MdToken = await ethers.getContractFactory("Mdtoken");
  const tokenContract = await MdToken.deploy();

  const MdAuction = await ethers.getContractFactory("MdAuction");
  const auctionContract = await MdAuction.deploy(
    tokenContract.address,
    nftContract.address
  );

  await nftContract.deployed();
  await tokenContract.deployed();
  await auctionContract.deployed();
  await nftContract.setValidTarget(auctionContract.address, true);

  console.log("Token deployed to: ", tokenContract.address);
  console.log("NFT deployed to: ", nftContract.address);
  console.log("Auction deployed to: ", auctionContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
