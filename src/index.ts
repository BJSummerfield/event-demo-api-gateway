import { ApolloServer, AuthenticationError } from 'apollo-server';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import jwt from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';

dotenv.config();

const client = jwksClient({
    jwksUri: `https://${process.env.B2C_TENANT_NAME}.b2clogin.com/${process.env.B2C_TENANT_NAME}.onmicrosoft.com/discovery/v2.0/keys?p=${process.env.B2C_POLICY_NAME}`,
});

const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 }); // Cache for 10 minutes

const getKey = (header: any, callback: any) => {
    const cachedKey = cache.get<SigningKey>(header.kid);
    if (cachedKey) {
        callback(null, cachedKey.getPublicKey());
    } else {
        client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                callback(err);
            } else {
                cache.set(header.kid, key);
                callback(null, key?.getPublicKey());
            }
        });
    }
};

const getUserFromToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getKey,
            {
                audience: process.env.B2C_CLIENT_ID,
                issuer: `${process.env.B2C_ISSUER_URL}`,
                algorithms: ['RS256'],
            },
            (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            }
        );
    });
};

const typeDefs = loadSchemaSync('src/schema.graphql', {
    loaders: [new GraphQLFileLoader()],
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const token = req.headers.authorization || '';
        if (!token) {
            throw new AuthenticationError('You must be logged in');
        }

        const user = await getUserFromToken(token.replace('Bearer ', '')).catch(() => {
            throw new AuthenticationError('Invalid/Expired token');
        });

        return { user };
    },
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
