require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Routes
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const videoRoutes = require('./routes/video.routes');
const artifactRoutes = require('./routes/artifact.routes');
const notificationRoutes = require('./routes/notification.routes');

// GraphQL
const { createGraphQLServer } = require('./graphql/apollo-server');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (!req.path.startsWith('/graphql')) {
      console.log(`${req.method} ${req.path}`);
    }
    next();
  });
}

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bytemeet')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// =============================================================================
// GRAPHQL SERVER SETUP
// =============================================================================

// Create GraphQL Yoga server
const { yoga, httpServer } = createGraphQLServer(app);

// Mount GraphQL endpoint
app.use('/graphql', yoga);

console.log('✅ GraphQL server ready at /graphql');

// =============================================================================
// REST API ROUTES (DEPRECATED - Use GraphQL at /graphql)
// These routes are maintained for backward compatibility during migration.
// New development should use the GraphQL API.
// =============================================================================

// Deprecation middleware for REST routes
const deprecationMiddleware = (req, res, next) => {
  res.set('Deprecation', 'true');
  res.set('Sunset', '2026-06-01');
  res.set('Link', '</graphql>; rel="successor-version"');
  res.set('X-API-Warn', 'REST API deprecated. Use GraphQL at /graphql');
  next();
};

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ByteMeet API is running',
    graphql: '/graphql',
    deprecated: 'REST API is deprecated. Please use GraphQL at /graphql',
    timestamp: new Date().toISOString(),
  });
});

// Apply deprecation middleware to all REST routes
app.use('/api', deprecationMiddleware);

// Auth routes
app.use('/api/auth', authRoutes);

// Subject routes
app.use('/api/subjects', subjectRoutes);

// Video routes
app.use('/api/video', videoRoutes);

// Artifact routes (Canvas)
app.use('/api/artifacts', artifactRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 ByteMeet API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 GraphQL: http://localhost:${PORT}/graphql`);
  console.log(`🔗 REST API: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
