'use client';

import React, { useMemo } from 'react';
import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    from,
    split,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';

interface GraphQLProviderProps {
    children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
    // Memoize client to prevent recreation on every render
    const client = useMemo(() => {
        // HTTP Link
        const httpLink = new HttpLink({
            uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql',
            credentials: 'include',
        });

        // Auth Link - reads token from localStorage and adds to headers
        const authLink = setContext((_, { headers }) => {
            // Get the authentication token from localStorage if it exists
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

            // Return the headers to the context so httpLink can read them
            return {
                headers: {
                    ...headers,
                    authorization: token ? `Bearer ${token}` : '',
                },
            };
        });

        // Retry Link
        const retryLink = new RetryLink({
            delay: {
                initial: 300,
                max: 3000,
                jitter: true,
            },
            attempts: {
                max: 3,
                retryIf: (error, operation) => {
                    // Don't retry mutations (except specific ones)
                    const isMutation = operation.query.definitions.some(
                        (def) => def.kind === 'OperationDefinition' && def.operation === 'mutation'
                    );
                    if (isMutation) return false;

                    // Retry on network errors
                    return !!error;
                },
            },
        });

        // Error handling link
        const errorLink = onError(({ graphQLErrors, networkError, operation }: any) => {
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, locations, path, extensions }: any) => {
                    console.error(`[GraphQL Error]: Message: ${message}, Path: ${path}`);

                    // Handle authentication errors
                    if (extensions?.code === 'UNAUTHENTICATED') {
                        console.warn('Authentication required - user may need to login');
                        // Could dispatch an event or use a callback for auth refresh
                    }
                });
            }

            if (networkError) {
                console.error(`[Network Error]: ${networkError}`);
            }
        });

        // Split link for future subscriptions (WebSocket)
        // Currently just passes everything to httpLink chain
        const splitLink = split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return (
                    definition.kind === 'OperationDefinition' &&
                    definition.operation === 'subscription'
                );
            },
            httpLink, // Replace with wsLink when ready
            from([errorLink, retryLink, authLink, httpLink])
        );

        return new ApolloClient({
            link: splitLink,
            cache: new InMemoryCache({
                typePolicies: {
                    Query: {
                        fields: {
                            // Merge policies for pagination if needed
                            notifications: {
                                keyArgs: ['filter', ['unreadOnly']],
                                merge(existing, incoming) {
                                    if (!existing) return incoming;
                                    return {
                                        ...incoming,
                                        nodes: [...(existing.nodes || []), ...incoming.nodes],
                                    };
                                },
                            },
                        },
                    },
                },
            }),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'cache-and-network',
                },
            },
        });
    }, []);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
