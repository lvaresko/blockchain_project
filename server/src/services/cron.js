const { CronJob } = require("cron");
const moment = require("moment-timezone");
const cronJob = require("cron").CronJob;
const { handleAuctionOpen, handleAuctionClose } = require("./auction");

main = async () => {
    const hour = moment().tz("Europe/Zagreb").hour();
    const minute = moment().tz("Europe/Zagreb").minutes();
    console.log("hour " + hour + " minute " + minute);
    if (hour >= 9 && hour <= 24 && minute == 6) {
        await handleAuctionOpen();
    } else if (hour >= 9 && hour <= 24 && minute == 8) {
        await handleAuctionClose();
    }
}

var job = new CronJob(
    "0 * * * * *",
    async () => {
        await main().catch(error => {
            console.log(error);
        });
    },
    null,
    true,
    "Europe/Zagreb"
);

function startJob() {
    console.log("Job run");
    job.start();
}

module.exports = {
    startJob
}
