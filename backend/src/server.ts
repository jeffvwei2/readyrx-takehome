import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { 
  securityHeaders, 
  rateLimiter, 
  corsConfig, 
  bodyParserConfig, 
  requestLogger, 
  errorHandler,
  startServer
} from './shared/middleware';

dotenv.config();

const app = express();

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

// Start server
startServer(app).catch(console.error);