import https from 'https';
import fs from 'fs';
import path from 'path';

export interface HttpsConfig {
  enabled: boolean;
  keyPath?: string;
  certPath?: string;
  port?: number;
}

export const getHttpsConfig = (): HttpsConfig => {
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;
  const httpsPort = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT) : 3443;

  return {
    enabled: httpsEnabled,
    keyPath,
    certPath,
    port: httpsPort
  };
};

export const createHttpsServer = (app: any): https.Server | null => {
  const config = getHttpsConfig();
  
  if (!config.enabled) {
    console.log('🔓 HTTPS disabled - using HTTP only');
    return null;
  }

  if (!config.keyPath || !config.certPath) {
    console.warn('⚠️  HTTPS enabled but SSL certificate paths not provided');
    console.warn('   Set SSL_KEY_PATH and SSL_CERT_PATH environment variables');
    return null;
  }

  try {
    const keyPath = path.resolve(config.keyPath);
    const certPath = path.resolve(config.certPath);

    // Check if files exist
    if (!fs.existsSync(keyPath)) {
      console.error(`❌ SSL key file not found: ${keyPath}`);
      return null;
    }

    if (!fs.existsSync(certPath)) {
      console.error(`❌ SSL certificate file not found: ${certPath}`);
      return null;
    }

    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    const httpsServer = https.createServer(options, app);
    
    console.log('🔒 HTTPS server configured successfully');
    console.log(`   Key: ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    
    return httpsServer;
  } catch (error) {
    console.error('❌ Failed to create HTTPS server:', error);
    return null;
  }
};

// If this file is run directly, generate the certificate
if (require.main === module) {
  generateSelfSignedCert();
}
