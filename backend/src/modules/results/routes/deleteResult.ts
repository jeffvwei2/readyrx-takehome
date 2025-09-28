import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const deleteResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await ResultService.deleteResult(id);
    
    if (!success) {
      res.status(404).json({ error: 'Result not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ error: 'Failed to delete result' });
  }
};
