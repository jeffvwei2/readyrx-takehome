# Security Configuration Guide

## Overview

This application implements comprehensive security measures for both data at rest and data in transit, following healthcare industry best practices.

## 🔒 Data Encryption

### At Rest (Firestore)
- **AES-256-CBC encryption** for sensitive data
- **Encrypted fields**: `patientId`, `metricName`, `result`, `labName`, `orderingProvider`, etc.
- **Automatic encryption/decryption** in all database operations
- **Environment variable**: `ENCRYPTION_KEY` (256-bit hex key)

### In Transit (HTTPS)
- **TLS 1.2+ encryption** for all client-server communication
- **Self-signed certificates** for development
- **Production certificates** recommended for deployment
- **HSTS headers** for browser security enforcement

## 🛡️ Security Features

### Authentication & Authorization
- **JWT-based API tokens** with role-based access control
- **Token expiration** and revocation capabilities
- **Role-based permissions** (admin, doctor, lab_tech, patient)

### Input Validation & Sanitization
- **Joi schema validation** for all API endpoints
- **SQL injection prevention** (NoSQL injection protection)
- **XSS protection** via input sanitization
- **File upload validation** and malware scanning

### API Security
- **Rate limiting** (100 requests per 15 minutes per IP)
- **CORS configuration** with allowed origins
- **Security headers** (Helmet.js)
- **Request logging** and audit trails

### Database Security
- **Encrypted sensitive fields** in Firestore
- **Access control** via Firebase security rules
- **Audit logging** for all data access

## 🚀 HTTPS Setup

### Development (Self-Signed Certificate)

1. **Generate certificate**:
   ```bash
   cd backend
   npm run generate-cert
   ```

2. **Configure environment**:
   ```bash
   # Add to .env file
   HTTPS_ENABLED=true
   SSL_KEY_PATH=ssl/server.key
   SSL_CERT_PATH=ssl/server.crt
   HTTPS_PORT=3443
   ```

3. **Start server**:
   ```bash
   npm run dev
   ```

4. **Access application**:
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:3443`

### Production (Real Certificate)

1. **Obtain SSL certificate** from trusted CA (Let's Encrypt, etc.)

2. **Configure environment**:
   ```bash
   HTTPS_ENABLED=true
   SSL_KEY_PATH=/path/to/private.key
   SSL_CERT_PATH=/path/to/certificate.crt
   HTTPS_PORT=443
   ```

3. **Update CORS origins**:
   ```bash
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

## 🔐 API Token Management

### Available Tokens
- **Admin Token**: Full access to all resources
- **Doctor Token**: Patient and lab order management
- **Lab Tech Token**: Lab results and uploads
- **Patient Token**: Own data only

### Usage
```bash
# Add to request headers
Authorization: Bearer YOUR_TOKEN_HERE
```

### Token Security
- **256-bit encryption** for sensitive data
- **Audit logging** for all token usage
- **Automatic expiration** (configurable)
- **Revocation capability** for compromised tokens

## 📊 Audit Logging

### Tracked Events
- **Authentication** attempts and failures
- **Data access** (read/write operations)
- **File uploads** and processing
- **Security violations** and suspicious activity
- **System errors** and exceptions

### Log Storage
- **Firestore collection**: `auditLogs`
- **Encrypted sensitive data** in logs
- **Retention policies** (configurable)
- **Search and filtering** capabilities

## 🚨 Security Monitoring

### Rate Limiting
- **100 requests per 15 minutes** per IP address
- **Configurable limits** per endpoint
- **Automatic blocking** of abusive IPs

### Error Handling
- **Sanitized error messages** (no sensitive data exposure)
- **Security event logging** for suspicious activity
- **Graceful degradation** on security failures

## 🔧 Environment Variables

### Required Security Variables
```bash
# Encryption
ENCRYPTION_KEY=your-256-bit-hex-key

# HTTPS (optional)
HTTPS_ENABLED=false
SSL_KEY_PATH=ssl/server.key
SSL_CERT_PATH=ssl/server.crt
HTTPS_PORT=3443

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📋 Compliance Features

### HIPAA Compliance
- **Data encryption** at rest and in transit
- **Access controls** and audit logging
- **Data retention** and deletion policies
- **Breach notification** procedures

### CLIA Compliance
- **Lab result integrity** and validation
- **Chain of custody** tracking
- **Quality control** measures
- **Documentation** requirements

### FDA 21 CFR Part 11
- **Electronic signatures** and authentication
- **Audit trails** and data integrity
- **System validation** and testing
- **Change control** procedures

## 🛠️ Security Best Practices

### Development
1. **Never commit** encryption keys or certificates
2. **Use environment variables** for sensitive configuration
3. **Validate all inputs** before processing
4. **Log security events** for monitoring
5. **Test security measures** regularly

### Production
1. **Use real SSL certificates** from trusted CAs
2. **Implement proper firewall** rules
3. **Monitor security logs** continuously
4. **Regular security audits** and penetration testing
5. **Keep dependencies updated** for security patches

## 🚨 Incident Response

### Security Breach Procedures
1. **Immediate isolation** of affected systems
2. **Notification** of relevant stakeholders
3. **Forensic analysis** of breach scope
4. **Remediation** and system hardening
5. **Documentation** and lessons learned

### Emergency Contacts
- **Security Team**: security@readyrx.com
- **IT Support**: support@readyrx.com
- **Compliance Officer**: compliance@readyrx.com

---

**⚠️ Important**: This is a development environment. For production deployment, additional security measures and compliance certifications may be required.