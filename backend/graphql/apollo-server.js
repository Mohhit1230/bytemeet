const { createSchema, createYoga } = require('graphql-yoga');
const { readFileSync } = require('fs');
const { join } = require('path');
const http = require('http');

// Read schema
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

/**
 * Create and configure GraphQL Yoga server
 */
function createGraphQLServer(app) {
    // Import resolvers
    const resolvers = require('./resolvers');

    // Import context factory
    const { createContext } = require('./context');

    // Create schema
    const schema = createSchema({
        typeDefs,
        resolvers,
    });

    // Create Yoga server
    const yoga = createYoga({
        schema,
        context: async ({ request }) => {
            // Extract cookies from request headers
            const cookieHeader = request.headers.get('cookie') || '';
            const cookies = {};
            cookieHeader.split(';').forEach((cookie) => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                    cookies[name] = value;
                }
            });

            // Get auth token from cookie or header
            const authHeader = request.headers.get('authorization') || '';
            const token =
                cookies.accessToken || authHeader.replace('Bearer ', '') || null;

            return createContext({ token, cookies });
        },
        graphiql: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
        maskedErrors: process.env.NODE_ENV === 'production',
    });

    // Create HTTP server
    const httpServer = http.createServer(app);

    return { yoga, httpServer };
}

module.exports = { createGraphQLServer };
