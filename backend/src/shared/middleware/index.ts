import { Request, Response, NextFunction } from 'express';

// Example middleware for logging requests
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// Example middleware for error handling
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
};
