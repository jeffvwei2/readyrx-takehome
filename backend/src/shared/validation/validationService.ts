import Joi from 'joi';

export class ValidationService {
  // Patient validation schemas
  static readonly patientSchema = Joi.object({
    name: Joi.string().min(2).max(100).trim().required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string().email().lowercase().trim().required()
      .messages({
        'string.email': 'Must be a valid email address',
        'any.required': 'Email is required'
      }),
    insurance: Joi.string().min(2).max(100).trim().optional()
      .messages({
        'string.min': 'Insurance must be at least 2 characters',
        'string.max': 'Insurance must not exceed 100 characters'
      }),
    dateOfBirth: Joi.date().max('now').optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future'
      }),
    ssn: Joi.string().pattern(/^\d{3}-\d{2}-\d{4}$/).optional()
      .messages({
        'string.pattern': 'SSN must be in format XXX-XX-XXXX'
      })
  });

  static readonly labOrderSchema = Joi.object({
    name: Joi.string().min(2).max(200).trim().required(),
    patientId: Joi.string().required(),
    orderId: Joi.number().integer().positive().required(),
    labId: Joi.string().required(),
    labTestId: Joi.string().required(),
    orderingProvider: Joi.string().min(2).max(100).trim().required(),
    status: Joi.string().valid('Ordered', 'In Progress', 'Completed', 'Cancelled').optional(),
    orderedDate: Joi.date().max('now').optional(),
    completedDate: Joi.date().max('now').optional()
  });

  static readonly labResultSchema = Joi.object({
    patientId: Joi.string().required(),
    metricId: Joi.string().required(),
    metricName: Joi.string().min(2).max(100).trim().required(),
    result: Joi.alternatives().try(
      Joi.object({
        type: Joi.string().valid('numeric').required(),
        value: Joi.number().required(),
        status: Joi.string().valid('normal', 'high', 'low', 'critical').required(),
        interpretation: Joi.string().optional()
      }),
      Joi.object({
        type: Joi.string().valid('descriptor').required(),
        value: Joi.string().min(1).max(100).required(),
        status: Joi.string().valid('normal', 'abnormal', 'positive', 'negative').required()
      })
    ).required(),
    labOrderId: Joi.string().required(),
    labTestId: Joi.string().required(),
    labId: Joi.string().required(),
    labName: Joi.string().min(2).max(100).trim().required(),
    orderId: Joi.number().integer().positive().required(),
    orderingProvider: Joi.string().min(2).max(100).trim().required(),
    resultDate: Joi.date().max('now').required()
  });

  static readonly fileUploadSchema = Joi.object({
    data: Joi.string().min(1).max(10 * 1024 * 1024).required() // 10MB max
      .messages({
        'string.max': 'File size must not exceed 10MB'
      }),
    labOrderId: Joi.string().optional(),
    labTestId: Joi.string().optional(),
    parserType: Joi.string().valid('HL7', 'FHIR', 'JSON').optional(),
    isNewOrder: Joi.boolean().optional()
  });

  static readonly loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters'
      })
  });

  static readonly registerSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
      .messages({
        'string.pattern': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    role: Joi.string().valid('admin', 'doctor', 'lab_tech', 'patient').required(),
    name: Joi.string().min(2).max(100).trim().required()
  });

  // Validation methods
  static validatePatient(data: any): { isValid: boolean; errors?: string[]; sanitizedData?: any } {
    const { error, value } = this.patientSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return {
      isValid: true,
      sanitizedData: this.sanitizeData(value)
    };
  }

  static validateLabOrder(data: any): { isValid: boolean; errors?: string[]; sanitizedData?: any } {
    const { error, value } = this.labOrderSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return {
      isValid: true,
      sanitizedData: this.sanitizeData(value)
    };
  }

  static validateLabResult(data: any): { isValid: boolean; errors?: string[]; sanitizedData?: any } {
    const { error, value } = this.labResultSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return {
      isValid: true,
      sanitizedData: this.sanitizeData(value)
    };
  }

  static validateFileUpload(data: any): { isValid: boolean; errors?: string[]; sanitizedData?: any } {
    const { error, value } = this.fileUploadSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return {
      isValid: true,
      sanitizedData: this.sanitizeData(value)
    };
  }

  static validateLogin(data: any): { isValid: boolean; errors?: string[]; sanitizedData?: any } {
    const { error, value } = this.loginSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return {
      isValid: true,
      sanitizedData: this.sanitizeData(value)
    };
  }

  static validateRegister(data: any): { isValid: boolean; errors?: string[]; sanitizedData?: any } {
    const { error, value } = this.registerSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return {
      isValid: true,
      sanitizedData: this.sanitizeData(value)
    };
  }

  // Sanitization methods
  static sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocols
      .replace(/javascript:/gi, '')
      // Remove data: protocols (except safe ones)
      .replace(/data:(?!image\/[png|jpg|jpeg|gif|svg])/gi, '')
      // Remove potential SQL injection patterns
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
      // Trim whitespace
      .trim();
  }

  // File validation
  static validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.toLowerCase().split('.').pop();
    return allowedTypes.includes(`.${extension}`);
  }

  static validateFileSize(fileSize: number, maxSizeBytes: number): boolean {
    return fileSize <= maxSizeBytes;
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
