import { Channel, connect } from "amqplib";

type Message = any;
const queue = process.env.QUEUE as string;

export function setupChannel() {
    return new Promise<Channel>(async (resolve, reject) => {
        try {
            const connection = await connect(
                `amqp://${process.env.HOST}:${process.env.PORT || 5672}`
            );
            const channel = await connection.createChannel();
            resolve(channel);
        } catch (err) {
            reject(err);
        }
    });
}

export function sendMessage(channel: Channel, data: Message) {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
}
