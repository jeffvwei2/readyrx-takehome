# Middleware Configuration Guide

## Overview
This document describes the middleware configuration for the ReadyRx application. All middleware is organized in `/shared/middleware` for better maintainability and reusability.

## Middleware Files

### 1. Security Headers (`securityHeaders.ts`)
Configures Helmet.js for security headers:

```typescript
import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
```

**Features:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### 2. Rate Limiting (`rateLimiter.ts`)
Configures express-rate-limit:

```typescript
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});
```

**Features:**
- Configurable window and request limits
- Health check endpoint exemption
- Standard rate limit headers
- Custom error messages

### 3. CORS Configuration (`corsConfig.ts`)
Configures Cross-Origin Resource Sharing:

```typescript
import cors from 'cors';

export const corsConfig = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
});
```

**Features:**
- Environment-based origin configuration
- Credential support
- Specific HTTP methods
- Custom headers
- Legacy browser support

### 4. Body Parser Configuration (`bodyParserConfig.ts`)
Configures request body parsing:

```typescript
import express from 'express';

export const bodyParserConfig = {
  json: express.json({ 
    limit: process.env.MAX_FILE_SIZE || '10mb' 
  }),
  urlencoded: express.urlencoded({ 
    extended: true, 
    limit: process.env.MAX_FILE_SIZE || '10mb' 
  })
};
```

**Features:**
- Configurable size limits
- JSON and URL-encoded support
- Environment-based configuration

### 5. Request Logger (`requestLogger.ts`)
Custom request logging middleware:

```typescript
import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

**Features:**
- Request start logging
- Response completion logging
- Duration calculation
- IP address tracking
- Timestamp formatting

### 6. Error Handler (`errorHandler.ts`)
Global error handling middleware:

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};
```

**Features:**
- Environment-based error details
- Stack trace in development
- Consistent error format
- Error logging

## Usage in Server

The middleware is imported and used in `server.ts`:

```typescript
import { 
  securityHeaders, 
  rateLimiter, 
  corsConfig, 
  bodyParserConfig, 
  requestLogger, 
  errorHandler 
} from './shared/middleware';

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
```

## Environment Configuration

### Required Variables
```bash
# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-256-bit-encryption-key
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760

# Environment
NODE_ENV=development
```

### Optional Variables
```bash
# Additional CORS origins
ALLOWED_ORIGINS=http://localhost:3000,https://app.yourdomain.com,https://admin.yourdomain.com

# Custom rate limits
RATE_LIMIT_WINDOW_MS=1800000  # 30 minutes
RATE_LIMIT_MAX_REQUESTS=200    # 200 requests per window

# Custom file size limits
MAX_FILE_SIZE=20971520  # 20MB
```

## Middleware Order

The middleware is applied in the following order for optimal security and functionality:

1. **Security Headers** - First line of defense
2. **Rate Limiting** - Prevent abuse
3. **CORS** - Control cross-origin requests
4. **Body Parsing** - Parse request bodies
5. **Request Logging** - Log all requests
6. **Routes** - Application routes
7. **Error Handler** - Catch and handle errors

## Customization

### Adding New Middleware
1. Create a new file in `/shared/middleware`
2. Export the middleware function
3. Add to `index.ts` exports
4. Import and use in `server.ts`

### Modifying Existing Middleware
1. Edit the specific middleware file
2. Update environment variables if needed
3. Test the changes
4. Update documentation

### Environment-Specific Configuration
Use `NODE_ENV` to configure middleware differently:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Different configurations based on environment
if (isDevelopment) {
  // More verbose logging
  // Relaxed CORS
  // Detailed error messages
}

if (isProduction) {
  // Minimal logging
  // Strict CORS
  // Generic error messages
}
```

## Testing Middleware

### Rate Limiting Test
```bash
# Test rate limiting (should fail after 100 requests)
for i in {1..105}; do
  curl http://localhost:5000/api/health
done
```

### CORS Test
```bash
# Test CORS from different origin
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:5000/api/patients
```

### Security Headers Test
```bash
# Check security headers
curl -I http://localhost:5000/api/health
```

## Best Practices

### Security
1. **Always use HTTPS** in production
2. **Configure CSP** appropriately for your app
3. **Set appropriate rate limits** for your use case
4. **Restrict CORS origins** to known domains
5. **Use environment variables** for sensitive configuration

### Performance
1. **Order middleware** correctly for optimal performance
2. **Skip rate limiting** for health checks
3. **Use appropriate body size limits**
4. **Log efficiently** to avoid performance impact

### Maintenance
1. **Keep middleware modular** and reusable
2. **Document configuration options**
3. **Use environment variables** for flexibility
4. **Test middleware changes** thoroughly
5. **Monitor middleware performance**

## Troubleshooting

### Common Issues

#### Rate Limiting Too Strict
```bash
# Increase limits in environment
RATE_LIMIT_WINDOW_MS=1800000  # 30 minutes
RATE_LIMIT_MAX_REQUESTS=500   # 500 requests
```

#### CORS Errors
```bash
# Add your domain to allowed origins
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Body Size Errors
```bash
# Increase file size limit
MAX_FILE_SIZE=20971520  # 20MB
```

#### Security Header Conflicts
- Check CSP directives for your app's requirements
- Adjust HSTS settings for your domain
- Verify X-Frame-Options compatibility

### Debugging
1. **Check environment variables** are set correctly
2. **Verify middleware order** in server.ts
3. **Test middleware individually** if issues arise
4. **Check console logs** for middleware errors
5. **Use browser dev tools** for CORS issues
