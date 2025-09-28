import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { 
  securityHeaders, 
  rateLimiter, 
  corsConfig, 
  bodyParserConfig, 
  requestLogger, 
  errorHandler 
} from './shared/middleware';
import { createHttpsServer, generateSelfSignedCert } from './shared/middleware/httpsConfig';
import { logApiTokens } from './utils/logApiTokens';
import { seedAll } from './seeding/seedAll';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting (needed when behind load balancers/proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);

// Rate limiting
app.use(rateLimiter);

// CORS configuration
app.use(corsConfig);

// Body parsing middleware
app.use(bodyParserConfig.json);
app.use(bodyParserConfig.urlencoded);

// Request logging
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Helper functions
const checkIfDatabaseHasData = async (): Promise<boolean> => {
  try {
    const { db } = await import('./config/firebase');
    
    // Check multiple collections to determine if data exists
    const collections = [
      'patients',
      'labs', 
      'labTests',
      'metrics',
      'labOrders',
      'patientResults',
      'requests',
      'auditLogs',
      'apiTokens'
    ];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      if (!snapshot.empty) {
        console.log(`📋 Found existing data in ${collectionName} collection`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking database for existing data:', error);
    // If we can't check, assume no data exists and proceed with seeding
    return false;
  }
};

const checkAndSeedIfNeeded = async (): Promise<void> => {
  try {
    console.log('\n🔍 Checking if database needs seeding...');
    
    // Check if database already has data
    const hasData = await checkIfDatabaseHasData();
    
    if (hasData) {
      console.log('✅ Database already contains data, skipping seeding');
      return;
    }
    
    console.log('📊 Database is empty, running initial seeding...');
    await seedAll();
    
  } catch (error) {
    console.error('❌ Error during seeding check:', error);
  }
};

// Start server
const startServer = async () => {
  // Check if database needs seeding (only if empty)
  await checkAndSeedIfNeeded();
  
  // Log available API tokens
  await logApiTokens();

  // Try to create HTTPS server first
  const httpsServer = createHttpsServer(app);
  
  if (httpsServer) {
    // Start HTTPS server
    httpsServer.listen(process.env.HTTPS_PORT || 3443, () => {
      console.log(`🔒 HTTPS Server is running on port ${process.env.HTTPS_PORT || 3443}`);
      console.log(`   Access your app at: https://localhost:${process.env.HTTPS_PORT || 3443}`);
    });
  } else {
    // Fallback to HTTP server
    console.log('🔓 Starting HTTP server (HTTPS not configured)');
  }

  // Always start HTTP server (for development or fallback)
  app.listen(PORT, () => {
    console.log(`🌐 HTTP Server is running on port ${PORT}`);
    console.log(`   Access your app at: http://localhost:${PORT}`);
    
    if (!httpsServer) {
      console.log('\n💡 To enable HTTPS:');
      console.log('   1. Run: npm run generate-cert');
      console.log('   2. Set HTTPS_ENABLED=true in your .env file');
      console.log('   3. Restart the server');
    }
  });
};

startServer().catch(console.error);