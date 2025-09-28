import { Request, Response } from 'express';
import { RequestService } from '../services/requestService';
import { CreateRequestRequest, CreateRequestResponse, GetRequestsResponse, GetRequestResponse } from '../types/requestTypes';

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await RequestService.getAllRequests();
    const response: GetRequestsResponse = { requests };
    res.json(response);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await RequestService.getRequestById(id);
    const response: GetRequestResponse = { request };
    res.json(response);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

export const getRequestsByLabOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { labOrderId } = req.params;
    const requests = await RequestService.getRequestsByLabOrderId(labOrderId);
    const response: GetRequestsResponse = { requests };
    res.json(response);
  } catch (error) {
    console.error('Error fetching requests by lab order:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};
