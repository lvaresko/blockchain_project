const { handleAuctionOpen, handleAuctionClose } = require("./services/auction");

main = async () => {
    await handleAuctionOpen();
}

main();