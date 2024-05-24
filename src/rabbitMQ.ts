// RabbitMQConnector.ts
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { IConsoleLoggerSettings } from '@cdm-logger/server'
import * as Logger from 'bunyan'

const settings: IConsoleLoggerSettings = {
    level: 'info', // Optional: default 'info' ('trace'|'info'|'debug'|'warn'|'error'|'fatal')
    mode: 'short' // Optional: default 'short' ('short'|'long'|'dev'|'raw')
}

class RabbitMQConnector {
    private pubsub!: AmqpPubSub;
    private config: string;
    private maxRetries: number;
    private retries: number;
    private logger: Logger;

    constructor(config: string, maxRetries = 10) {
        this.config = config;
        this.maxRetries = maxRetries;
        this.retries = 0;
        this.connectWithRetry();
        this.logger = Logger.createLogger({ name: 'RabbitMQConnector', level: settings.level })
    }

    private connectWithRetry() {
        const createPubSub = () => new AmqpPubSub({
            config: this.config,
            logger: this.logger,
            connectionListener: (err) => {
                if (err) {
                    if (this.retries < this.maxRetries) {
                        this.retries++;
                        console.log(`Retrying RabbitMQ connection (${this.retries}/${this.maxRetries})...`);
                        setTimeout(createPubSub, 5000); // Retry after 5 seconds
                    } else {
                        console.log('Max retries reached. Could not connect to RabbitMQ.');
                        process.exit(1); // Exit process if max retries are reached
                    }
                } else {
                    this.retries = 0; // Reset retries on successful connection
                    console.log('Connected to RabbitMQ.');
                }
            }
        });

        this.pubsub = createPubSub();
    }

    public getPubSub(): AmqpPubSub {
        return this.pubsub;
    }
}

export const rabbitMQConnector = new RabbitMQConnector('amqp://rabbitmq:5672/');
