import "dotenv/config";
import { getAddresses } from "./bigquery/bigqueryUtils";
import { setupWeb3, startListening } from "./web3/web3Utils";
import { setupChannel } from "./rabbit/rabbitUtils";

(async () => {
    let interval: NodeJS.Timer | null = null;
    try {
        const logMessageCount =
            (process.env.LOG_MESSAGE_COUNT as string).toLowerCase() === "true";
        interval = await startListening(
            await setupWeb3(),
            await getAddresses(),
            await setupChannel(),
            logMessageCount
        );
    } catch (err) {
        console.log(err);
        if (interval) clearInterval(interval);
        throw new Error("Something went wrong");
    }
})();
