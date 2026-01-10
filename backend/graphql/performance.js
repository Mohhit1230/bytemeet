/**
 * GraphQL Performance Middleware
 * 
 * Adds query complexity analysis, depth limiting, and response caching
 */

const { GraphQLError } = require('graphql');

// =============================================================================
// QUERY COMPLEXITY ANALYSIS
// =============================================================================

/**
 * Field complexity costs for query analysis
 */
const fieldComplexityCosts = {
    // High cost - database joins
    members: 10,
    artifacts: 10,
    notifications: 10,
    pendingRequests: 10,

    // Medium cost - single record lookups
    owner: 5,
    createdBy: 5,
    fromUser: 5,
    subject: 5,
    user: 5,

    // Low cost - simple fields
    default: 1,
};

/**
 * Calculate query complexity
 * @param {Object} info - GraphQL resolve info
 * @param {number} depth - Current depth
 * @returns {number} - Complexity score
 */
function calculateComplexity(selectionSet, depth = 0, maxDepth = 7) {
    if (!selectionSet || depth > maxDepth) {
        return 0;
    }

    let complexity = 0;

    for (const selection of selectionSet.selections) {
        if (selection.kind === 'Field') {
            const fieldName = selection.name.value;
            const fieldCost = fieldComplexityCosts[fieldName] || fieldComplexityCosts.default;

            // Add base cost
            complexity += fieldCost;

            // Add cost for list arguments (pagination increases complexity)
            if (selection.arguments) {
                for (const arg of selection.arguments) {
                    if (arg.name.value === 'limit' && arg.value.kind === 'IntValue') {
                        const limit = parseInt(arg.value.value, 10);
                        complexity += Math.min(limit, 50) * 0.5;
                    }
                }
            }

            // Recursively calculate nested complexity
            if (selection.selectionSet) {
                complexity += calculateComplexity(selection.selectionSet, depth + 1, maxDepth);
            }
        }

        if (selection.kind === 'FragmentSpread' || selection.kind === 'InlineFragment') {
            if (selection.selectionSet) {
                complexity += calculateComplexity(selection.selectionSet, depth + 1, maxDepth);
            }
        }
    }

    return complexity;
}

// =============================================================================
// QUERY DEPTH LIMITING
// =============================================================================

/**
 * Calculate max query depth
 */
function calculateDepth(selectionSet, depth = 0) {
    if (!selectionSet) {
        return depth;
    }

    let maxDepth = depth;

    for (const selection of selectionSet.selections) {
        if (selection.selectionSet) {
            const nestedDepth = calculateDepth(selection.selectionSet, depth + 1);
            maxDepth = Math.max(maxDepth, nestedDepth);
        }
    }

    return maxDepth;
}

// =============================================================================
// COMPLEXITY PLUGIN
// =============================================================================

/**
 * Create complexity validation plugin
 */
function createComplexityPlugin(options = {}) {
    const { maxComplexity = 500, maxDepth = 10 } = options;

    return {
        onExecute({ args }) {
            const { document, operationName } = args;

            // Find the operation
            let operation = null;
            for (const def of document.definitions) {
                if (def.kind === 'OperationDefinition') {
                    if (!operationName || def.name?.value === operationName) {
                        operation = def;
                        break;
                    }
                }
            }

            if (!operation) return;

            // Calculate complexity
            const complexity = calculateComplexity(operation.selectionSet);
            const depth = calculateDepth(operation.selectionSet);

            // Log for monitoring
            if (process.env.NODE_ENV !== 'production') {
                console.log(
                    `[GraphQL] ${operation.operation} ${operationName || 'anonymous'}: ` +
                    `complexity=${complexity}, depth=${depth}`
                );
            }

            // Reject overly complex queries
            if (complexity > maxComplexity) {
                throw new GraphQLError(
                    `Query complexity (${complexity}) exceeds maximum allowed (${maxComplexity})`,
                    {
                        extensions: { code: 'QUERY_TOO_COMPLEX', complexity, maxComplexity },
                    }
                );
            }

            // Reject overly deep queries
            if (depth > maxDepth) {
                throw new GraphQLError(
                    `Query depth (${depth}) exceeds maximum allowed (${maxDepth})`,
                    {
                        extensions: { code: 'QUERY_TOO_DEEP', depth, maxDepth },
                    }
                );
            }
        },
    };
}

// =============================================================================
// RESPONSE CACHE HEADERS
// =============================================================================

/**
 * Cache directives for different query types
 */
const cacheDirectives = {
    // Public, cacheable for 5 minutes
    public: 'public, max-age=300, s-maxage=300',

    // Private, cacheable for 1 minute (user-specific)
    private: 'private, max-age=60',

    // No caching for mutations
    noCache: 'no-store, no-cache, must-revalidate',
};

/**
 * Determine cache directive based on operation
 */
function getCacheDirective(operationType, operationName) {
    if (operationType === 'mutation') {
        return cacheDirectives.noCache;
    }

    // Public queries that can be cached longer
    const publicQueries = ['checkUsername', 'checkEmail', 'subjectByInviteCode'];

    if (publicQueries.includes(operationName)) {
        return cacheDirectives.public;
    }

    // User-specific queries
    return cacheDirectives.private;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    calculateComplexity,
    calculateDepth,
    createComplexityPlugin,
    getCacheDirective,
    cacheDirectives,
    fieldComplexityCosts,
};
