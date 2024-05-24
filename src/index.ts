import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { useServer } from 'graphql-ws/lib/use/ws';
import resolvers from './resolvers.js';
import { rabbitMQConnector } from './rabbitMQ.js';
import bodyParser from 'body-parser';
import BirthdayService from './datasources/birthdayService.js';
import NameService from './datasources/nameService.js';
import UserManagementService from './datasources/userManagementService.js';

const PORT = 4000;
const pubsub = rabbitMQConnector.getPubSub();

const typeDefs = loadSchemaSync('src/schema.graphql', {
    loaders: [new GraphQLFileLoader()],
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    dataSources: {
                        birthdayService: new BirthdayService(),
                        nameService: new NameService(),
                        userManagementService: new UserManagementService(),
                    },
                    pubsub,
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

await server.start();
app.use('/graphql', bodyParser.json(), expressMiddleware(server));

httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`);
});
