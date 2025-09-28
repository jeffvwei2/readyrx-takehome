/**
 * Server Detection Utility
 * Automatically detects which port the backend server is running on
 */

export interface ServerConfig {
  baseURL: string;
  protocol: 'http' | 'https';
  port: number;
}

/**
 * Detects which server port is available and returns the appropriate configuration
 */
export const detectServerConfig = async (): Promise<ServerConfig> => {
  // Try HTTPS first (port 3001)
  try {
    const httpsResponse = await fetch('https://localhost:3001/api/auth/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ignore SSL certificate errors for self-signed certificates
      mode: 'cors',
    });
    
    if (httpsResponse.ok || httpsResponse.status === 401) {
      // Server is responding (401 is expected without auth)
      return {
        baseURL: 'https://localhost:3001',
        protocol: 'https',
        port: 3001
      };
    }
  } catch (error) {
    console.log('HTTPS server not available, trying HTTP...');
  }

  // Try HTTP (port 3002)
  try {
    const httpResponse = await fetch('http://localhost:3002/api/auth/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (httpResponse.ok || httpResponse.status === 401) {
      // Server is responding (401 is expected without auth)
      return {
        baseURL: 'http://localhost:3002',
        protocol: 'http',
        port: 3002
      };
    }
  } catch (error) {
    console.error('Neither HTTPS nor HTTP server is available');
  }

  // Fallback to HTTPS (default)
  return {
    baseURL: 'https://localhost:3001',
    protocol: 'https',
    port: 3001
  };
};

/**
 * Updates axios default base URL based on detected server
 */
export const configureAxios = async (): Promise<ServerConfig> => {
  const config = await detectServerConfig();
  
  // Set axios default base URL
  const axios = (await import('axios')).default;
  axios.defaults.baseURL = config.baseURL;
  
  console.log(`🔗 Frontend configured to use: ${config.baseURL}`);
  
  return config;
};
