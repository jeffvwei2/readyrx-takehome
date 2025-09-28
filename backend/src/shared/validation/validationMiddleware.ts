import { Request, Response, NextFunction } from 'express';
import { ValidationService } from './validationService';

export const validatePatient = (req: Request, res: Response, next: NextFunction): void => {
  const validation = ValidationService.validatePatient(req.body);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
    return;
  }
  
  req.body = validation.sanitizedData;
  next();
};

export const validateLabOrder = (req: Request, res: Response, next: NextFunction): void => {
  const validation = ValidationService.validateLabOrder(req.body);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
    return;
  }
  
  req.body = validation.sanitizedData;
  next();
};

export const validateLabResult = (req: Request, res: Response, next: NextFunction): void => {
  const validation = ValidationService.validateLabResult(req.body);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
    return;
  }
  
  req.body = validation.sanitizedData;
  next();
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  const validation = ValidationService.validateFileUpload(req.body);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
    return;
  }
  
  req.body = validation.sanitizedData;
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const validation = ValidationService.validateLogin(req.body);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
    return;
  }
  
  req.body = validation.sanitizedData;
  next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const validation = ValidationService.validateRegister(req.body);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
    return;
  }
  
  req.body = validation.sanitizedData;
  next();
};

// Generic validation middleware
export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((detail: any) => detail.message)
      });
      return;
    }
    
    req.body = ValidationService.sanitizeData(value);
    next();
  };
};
