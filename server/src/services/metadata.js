const Moralis = require("moralis-v1/node");
const fs = require("fs");
const path = require("path");


async function createMetadataJson(nftId) {
    console.log("METADATA JSON");
    let metadata = {
        name: `Multi Deactive Token ${nftId}`,
        description: `A powerful NFT from Multi Deactive`,
        image: `https://gateway.moralisipfs.com/ipfs/QmdZ3pzYUUTBZeL8upmAEV3s9uDohxX2GTg7NVEQFHSGXp/${nftId}.jpg`,
        attributes: [],
    };

    fs.writeFileSync(
        path.resolve(`src/build/json/${nftId}.json`),
        JSON.stringify(metadata)
    );

    const zipFile = fs.readFileSync(
        path.resolve(`src/build/json/${nftId}.json`),
        "base64"
    );


    await Moralis.start({
        serverUrl: process.env.SERVER_URL,
        appId: process.env.APP_ID,
        masterKey: process.env.MASTER_KEY
    });

    const file = new Moralis.File("Multi-Deactive" + nftId + ".json", {
        base64: zipFile
    });

    await file.saveIPFS({ useMasterKey: true });


    return `ipfs//${file.hash()}`;
}

main = async () => {
    await createMetadataJson(1);
};

module.exports = { main, createMetadataJson };