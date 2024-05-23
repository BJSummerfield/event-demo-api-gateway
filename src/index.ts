import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import resolvers from './resolvers.js';
import { checkDataSourceConnections } from './healthCheck.js';

// Load GraphQL schema from file
const typeDefs = loadSchemaSync('src/schema.graphql', {
    loaders: [new GraphQLFileLoader()],
});

// Create the schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Initialize the ApolloServer instance
const server = new ApolloServer({
    schema,
});

// Create an HTTP server
const httpServer = createServer();

// Set up WebSocket server
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
});

useServer({ schema }, wsServer);

// Start the standalone server
(async () => {
    const { birthdayService, nameService, userManagementService } = await checkDataSourceConnections();

    const { url } = await startStandaloneServer(server, {
        listen: { port: process.env.PORT ? parseInt(process.env.PORT) : 4000 },
        context: async () => ({
            dataSources: {
                birthdayService,
                nameService,
                userManagementService,
            },
        }),
    });

    console.log(`🚀 Server ready at ${url}`);
    httpServer.listen(process.env.PORT ? parseInt(process.env.PORT) : 4000, () => {
        console.log(`🚀 Subscriptions ready at ws://localhost:${process.env.PORT ? parseInt(process.env.PORT) : 4000}/graphql`);
    });
})();
