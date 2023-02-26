import { Eth, Web3Utils } from "@crypto-jambot/web3-utils";
import { Subscription } from "web3-core-subscriptions";
import { Log } from "web3-core";
import { SecretUtil } from "@crypto-jambot/secret-manager-utils";
import { Channel } from "amqplib";
import { getData, getV2SwapHash, getV3SwapHash } from "./logUtils";
import { INTERVAL_CONSTANT } from "../constant/constant";
import { sendMessage } from "../rabbit/rabbitUtils";
import { v4 as uuidV4 } from "uuid";

let RUNNING_COUNT = 0;
export function setupWeb3() {
    return new Promise<Eth>(async (resolve, reject) => {
        try {
            const apiKey = await new SecretUtil().getSecretString(
                "api-secret-key"
            );
            const utils = new Web3Utils(apiKey);
            const eth = await utils.getEthereum({ isWebsocket: true });
            resolve(eth);
        } catch (err) {
            reject(err);
        }
    });
}

export async function startListening(
    eth: Eth,
    addresses: string[],
    channel: Channel,
    logMessageCount = false
) {
    return new Promise<NodeJS.Timer>(async (resolve, reject) => {
        try {
            let subscription = await subscribe(
                eth,
                addresses,
                channel,
                logMessageCount
            );
            const interval = await restartListener(
                subscription,
                eth,
                addresses,
                channel,
                logMessageCount
            );
            resolve(interval);
        } catch (err) {
            reject(err);
        }
    });
}

function subscribe(
    eth: Eth,
    addresses: string[],
    channel: Channel,
    logMessageCount = false
) {
    return new Promise<Subscription<Log>>((resolve, reject) => {
        try {
            const subscription = eth.subscribe(
                "logs",
                {
                    topics: [[getV2SwapHash(eth), getV3SwapHash(eth)]],
                    address: addresses,
                },
                (error, { address, data, topics }) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    if (logMessageCount) {
                        RUNNING_COUNT++;
                        console.clear();
                        console.log(`Messages Sent: ${RUNNING_COUNT}`);
                    }
                    sendMessage(channel, {
                        ...getData(eth, data, topics),
                        address,
                        id: uuidV4(),
                    });
                }
            );
            resolve(subscription);
        } catch (err) {
            reject(err);
        }
    });
}

function restartListener(
    listener: Subscription<Log>,
    eth: Eth,
    addresses: string[],
    channel: Channel,
    logMessageCount = false
) {
    return new Promise<NodeJS.Timer>((resolve, reject) => {
        try {
            const interval = setInterval(async () => {
                if (await listener.unsubscribe()) {
                    reject("Failed to unsubscribe");
                    return;
                }
                listener = await subscribe(
                    eth,
                    addresses,
                    channel,
                    logMessageCount
                );
            }, INTERVAL_CONSTANT);
            resolve(interval);
        } catch (err) {
            reject(err);
        }
    });
}
