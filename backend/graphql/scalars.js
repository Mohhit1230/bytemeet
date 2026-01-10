const { GraphQLScalarType, Kind } = require('graphql');

const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString(); // Convert outgoing Date to string
        }
        return value; // Should be string already
    },
    parseValue(value) {
        return new Date(value); // Convert incoming integer/string to Date
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST integer to Date
        }
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value); // Convert hard-coded AST string to Date
        }
        return null; // Invalid hard-coded value (not an integer/string)
    },
});

const JSONScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value) {
        return value; // Identity serialization
    },
    parseValue(value) {
        return value; // Identity parsing
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.OBJECT) {
            const value = Object.create(null);
            ast.fields.forEach((field) => {
                value[field.name.value] = parseLiteral(field.value);
            });
            return value;
        }
        return parseLiteral(ast);
    },
});

// Helper for recursive parsing of JSON literal
function parseLiteral(ast) {
    switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
            return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
            return parseFloat(ast.value);
        case Kind.OBJECT: {
            const value = Object.create(null);
            ast.fields.forEach((field) => {
                value[field.name.value] = parseLiteral(field.value);
            });
            return value;
        }
        case Kind.LIST:
            return ast.values.map(parseLiteral);
        default:
            return null;
    }
}

module.exports = {
    DateTime,
    JSON: JSONScalar,
};
