/**
 * Server Startup Middleware
 * Handles server startup logic including HTTPS/HTTP server configuration
 */

import express from 'express';
import { createHttpsServer } from './httpsConfig';
import { logApiTokens } from '../../utils/logApiTokens';
import { checkAndSeedIfNeeded } from './databaseSeeding';

/**
 * Starts the HTTP server
 */
const startHttpServer = (app: express.Application, port: string | number, httpsServer?: any) => {
  app.listen(port, () => {
    console.log(`🌐 HTTP Server is running on port ${port}`);
    console.log(`   Access your app at: http://localhost:${port}`);
    
    if (!httpsServer) {
      console.log('\n💡 To enable HTTPS:');
      console.log('   1. Run: npm run generate-cert');
      console.log('   2. Set HTTPS_ENABLED=true in your .env file');
      console.log('   3. Restart the server');
    }
  });
};

/**
 * Starts the server with HTTPS/HTTP configuration
 */
export const startServer = async (app: express.Application) => {
  // Check if database needs seeding (only if empty)
  await checkAndSeedIfNeeded();
  
  // Log available API tokens
  await logApiTokens();

  // Try to create HTTPS server first
  const httpsServer = createHttpsServer(app);
  const httpsPort = process.env.HTTPS_PORT || 3001; // Changed from 3443 to 3001
  const httpPort = process.env.PORT || 3002; // Changed to 3002 to avoid conflict
  
  if (httpsServer) {
    // Try to start HTTPS server
    httpsServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ HTTPS port ${httpsPort} is already in use`);
        console.log('🔓 Falling back to HTTP server');
        startHttpServer(app, httpPort, httpsServer);
      } else {
        console.error('❌ HTTPS server error:', error);
        console.log('🔓 Falling back to HTTP server');
        startHttpServer(app, httpPort, httpsServer);
      }
    });
    
    httpsServer.listen(httpsPort, () => {
      console.log(`🔒 HTTPS Server is running on port ${httpsPort}`);
      console.log(`   Access your app at: https://localhost:${httpsPort}`);
      console.log('✅ HTTPS server started successfully');
    });
  } else {
    console.log('🔓 Starting HTTP server (HTTPS not configured)');
    startHttpServer(app, httpPort);
  }
};
