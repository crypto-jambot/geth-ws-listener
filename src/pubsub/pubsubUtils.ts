import { PubSub } from "@google-cloud/pubsub";

const client = new PubSub();
const TOPIC = process.env.TOPIC;

export function sendToTopic(data: string) {
    const dataBuffer = Buffer.from(data);
    return new Promise<string>((resolve, reject) => {
        try {
            if (!TOPIC) {
                reject({ message: "TOPIC environment variable must be set." });
                return;
            }
            resolve(client.topic(TOPIC).publishMessage({ data: dataBuffer }));
        } catch (err: any) {
            reject(`Received error while publishing: ${err.message}`);
        }
    });
}
