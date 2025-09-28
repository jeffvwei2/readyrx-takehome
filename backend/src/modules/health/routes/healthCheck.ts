import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ message: 'Server is running!' });
};
