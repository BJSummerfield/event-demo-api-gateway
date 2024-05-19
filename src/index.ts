import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import resolvers from './resolvers.js';
import { checkDataSourceConnections } from './healthCheck.js';

// Load GraphQL schema from file
const typeDefs = loadSchemaSync('src/schema.graphql', {
    loaders: [new GraphQLFileLoader()],
});

// Initialize the ApolloServer instance
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Start the standalone server
(async () => {
    const { birthdayService, nameService } = await checkDataSourceConnections();

    const { url } = await startStandaloneServer(server, {
        listen: { port: process.env.PORT ? parseInt(process.env.PORT) : 4000 },
        context: async () => ({
            dataSources: {
                birthdayService,
                nameService,
            },
        }),
    });

    console.log(`🚀 Server ready at ${url}`);
})();
