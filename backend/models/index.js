/**
 * ByteMeet Backend Models - Index
 * 
 * Central export for all MongoDB models.
 * Usage: const { User, Artifact } = require('./models');
 */

const User = require('./user.model');
const Artifact = require('./artifact.model');

module.exports = {
    User,
    Artifact,
};
