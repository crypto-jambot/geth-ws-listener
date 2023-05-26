import "dotenv/config";
import { getAddresses } from "./bigquery/bigqueryUtils";
import { setupWeb3, startListening } from "./web3/web3Utils";
import { sendToTopic } from "./pubsub/pubsubUtils";

(async () => {
    let interval: NodeJS.Timer | null = null;
    try {
        const logMessageCount = process.env.LOG_MESSAGE_COUNT
            ? (process.env.LOG_MESSAGE_COUNT as string).toLowerCase() === "true"
            : false;

        interval = await startListening(
            await setupWeb3(),
            await getAddresses(),
            sendToTopic,
            logMessageCount
        );
    } catch (err) {
        console.log(err);
        if (interval) clearInterval(interval);
        throw new Error("Something went wrong");
    }
})();
