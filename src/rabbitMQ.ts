import * as amqp from 'amqplib';
import { AMQPPubSub } from 'graphql-amqp-subscriptions';

const config = 'amqp://rabbitmq:5672/?heartbeat=30';
const exchangeName = 'user_events';
const queueName = 'graphql_subscription_queue';
const routingKeys = ['userManagement.userCreated'];
const maxRetries = 5;
const retryDelay = 5000;

let pubsub: AMQPPubSub;

async function connectRabbitMQ(): Promise<void> {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const connection = await amqp.connect(config);
            pubsub = new AMQPPubSub({
                connection,
                exchange: {
                    name: exchangeName,
                    type: 'topic',
                    options: {
                        durable: false,
                        autoDelete: false,
                    },
                },
                queue: {
                    name: queueName,
                    options: {
                        exclusive: false,
                        durable: true,
                        autoDelete: false,
                    },
                },
            });

            const channel = await connection.createChannel();
            await channel.assertExchange(exchangeName, 'topic', { durable: false, autoDelete: false });
            await channel.assertQueue(queueName, { exclusive: false });

            for (const key of routingKeys) {
                await channel.bindQueue(queueName, exchangeName, key);
            }

            channel.consume(queueName, (msg) => {
                if (msg) {
                    console.log('Received message STRINGIFIED:', msg.content.toString());
                    const eventKey = msg.fields.routingKey.split('.')[1];
                    const payload = JSON.parse(msg.content.toString());
                    const data = payload.payload; // Directly use payload's data
                    console.log("payload", payload);
                    console.log("data", data);
                    pubsub.publish(eventKey, { userCreated: data }); // Publish the data directly
                }
            }, {
                noAck: true,
            });

            console.log('Connected to RabbitMQ and exchange set up.');
            break;
        } catch (error) {
            retries++;
            console.error(`Failed to connect to RabbitMQ. Attempt ${retries}/${maxRetries}:`, error);
            if (retries >= maxRetries) {
                console.error('Max retries reached, failing startup.');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

// Ensure connection is established before exporting
(async () => {
    await connectRabbitMQ();
})();

export { pubsub };
