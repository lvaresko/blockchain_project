const { ethers } = require("ethers");
const dotenv = require('dotenv').config({ path: "./src/.env" });

const getSigner = () => {
    const provider = getProvider();
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    return signer;
};

const getProvider = () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    console.log(provider);
    return provider;
};

module.exports = {
    getSigner,
    getProvider
};