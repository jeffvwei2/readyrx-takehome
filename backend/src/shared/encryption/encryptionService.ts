import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly SALT_LENGTH = 32; // 256 bits

  private static getEncryptionKey(): Buffer {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    
    // If key is hex string, convert to buffer
    if (keyString.length === 64) {
      return Buffer.from(keyString, 'hex');
    }
    
    // Otherwise, derive key from string using PBKDF2
    return crypto.pbkdf2Sync(keyString, 'salt', 100000, this.KEY_LENGTH, 'sha256');
  }

  static encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      // Create cipher using CBC mode with explicit IV
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine iv + encrypted data
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Check if the data is long enough to contain IV + encrypted data
      if (combined.length < this.IV_LENGTH) {
        throw new Error('Invalid encrypted data format - too short');
      }
      
      // Extract iv and encrypted data
      const iv = combined.subarray(0, this.IV_LENGTH);
      const encrypted = combined.subarray(this.IV_LENGTH);
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static encryptSensitiveField(value: string): string {
    if (!value || value.trim() === '') {
      return value;
    }
    return this.encrypt(value);
  }

  static decryptSensitiveField(encryptedValue: string): string {
    if (!encryptedValue || encryptedValue.trim() === '') {
      return encryptedValue;
    }
    
    // Check if the value looks like encrypted data (base64 encoded)
    // If it doesn't look encrypted, return as-is for backward compatibility
    try {
      // Try to decode as base64 and check if it looks like encrypted data
      const decoded = Buffer.from(encryptedValue, 'base64');
      if (decoded.length < 16) { // Too short to be encrypted (needs IV + data)
        return encryptedValue; // Return original value if not encrypted
      }
      return this.decrypt(encryptedValue);
    } catch (error: any) {
      // If decryption fails, return the original value for backward compatibility
      console.warn('Failed to decrypt field, returning original value:', error.message);
      return encryptedValue;
    }
  }

  static encryptLabResult(result: any): any {
    if (!result) return result;

    const encryptedResult = { ...result };
    
    console.log(`Encryption Service - Encrypting lab result with metricName: "${encryptedResult.metricName}"`);
    
    // Encrypt sensitive fields
    if (encryptedResult.result && typeof encryptedResult.result === 'object') {
      if (encryptedResult.result.value && typeof encryptedResult.result.value === 'string') {
        encryptedResult.result.value = this.encryptSensitiveField(encryptedResult.result.value);
      }
    }
    
    // Encrypt other sensitive fields
    if (encryptedResult.metricName) {
      console.log(`Encryption Service - Encrypting metricName: "${encryptedResult.metricName}"`);
      encryptedResult.metricName = this.encryptSensitiveField(encryptedResult.metricName);
      console.log(`Encryption Service - Encrypted metricName: "${encryptedResult.metricName}"`);
    }
    
    if (encryptedResult.labName) {
      encryptedResult.labName = this.encryptSensitiveField(encryptedResult.labName);
    }
    
    if (encryptedResult.orderingProvider) {
      encryptedResult.orderingProvider = this.encryptSensitiveField(encryptedResult.orderingProvider);
    }

    return encryptedResult;
  }

  static decryptLabResult(encryptedResult: any): any {
    if (!encryptedResult) return encryptedResult;

    const decryptedResult = { ...encryptedResult };
    
    // Decrypt sensitive fields
    if (decryptedResult.result && typeof decryptedResult.result === 'object') {
      if (decryptedResult.result.value && typeof decryptedResult.result.value === 'string') {
        decryptedResult.result.value = this.decryptSensitiveField(decryptedResult.result.value);
      }
      // Note: Numeric values are not encrypted, so they remain as-is
    }
    
    // Decrypt other sensitive fields
    if (decryptedResult.metricName) {
      decryptedResult.metricName = this.decryptSensitiveField(decryptedResult.metricName);
    }
    
    if (decryptedResult.labName) {
      decryptedResult.labName = this.decryptSensitiveField(decryptedResult.labName);
    }
    
    if (decryptedResult.orderingProvider) {
      decryptedResult.orderingProvider = this.decryptSensitiveField(decryptedResult.orderingProvider);
    }

    return decryptedResult;
  }

  static encryptFileContent(content: string): string {
    return this.encrypt(content);
  }

  static decryptFileContent(encryptedContent: string): string {
    return this.decrypt(encryptedContent);
  }

  static encryptPatientData(patient: any): any {
    if (!patient) return patient;

    const encryptedPatient = { ...patient };
    
    // Encrypt sensitive patient fields
    if (encryptedPatient.name) {
      encryptedPatient.name = this.encryptSensitiveField(encryptedPatient.name);
    }
    
    if (encryptedPatient.email) {
      encryptedPatient.email = this.encryptSensitiveField(encryptedPatient.email);
    }
    
    if (encryptedPatient.insurance) {
      encryptedPatient.insurance = this.encryptSensitiveField(encryptedPatient.insurance);
    }
    
    if (encryptedPatient.ssn) {
      encryptedPatient.ssn = this.encryptSensitiveField(encryptedPatient.ssn);
    }

    return encryptedPatient;
  }

  static decryptPatientData(encryptedPatient: any): any {
    if (!encryptedPatient) return encryptedPatient;

    const decryptedPatient = { ...encryptedPatient };
    
    // Decrypt sensitive patient fields
    if (decryptedPatient.name) {
      decryptedPatient.name = this.decryptSensitiveField(decryptedPatient.name);
    }
    
    if (decryptedPatient.email) {
      decryptedPatient.email = this.decryptSensitiveField(decryptedPatient.email);
    }
    
    if (decryptedPatient.insurance) {
      decryptedPatient.insurance = this.decryptSensitiveField(decryptedPatient.insurance);
    }
    
    if (decryptedPatient.ssn) {
      decryptedPatient.ssn = this.decryptSensitiveField(decryptedPatient.ssn);
    }

    return decryptedPatient;
  }

  static generateEncryptionKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Utility method to check if a string is encrypted
  static isEncrypted(value: string): boolean {
    try {
      // Try to decode as base64 and check structure
      const decoded = Buffer.from(value, 'base64');
      return decoded.length > this.IV_LENGTH;
    } catch {
      return false;
    }
  }
}
