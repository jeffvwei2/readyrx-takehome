import { db } from '../../../config/firebase';
import { Request, CreateRequestRequest } from '../types/requestTypes';

export const createRequest = async (requestData: CreateRequestRequest): Promise<string> => {
  const requestRef = await db.collection('requests').add({
    ...requestData,
    createdAt: new Date(),
  });
  
  return requestRef.id;
};

export const getAllRequests = async (): Promise<Request[]> => {
  const requestsSnapshot = await db.collection('requests').get();
  const requests: Request[] = [];
  
  requestsSnapshot.forEach(doc => {
    const data = doc.data();
    requests.push({ 
      id: doc.id, 
      labOrderId: data.labOrderId,
      patientId: data.patientId,
      labId: data.labId,
      labTestId: data.labTestId,
      orderId: data.orderId,
      orderingProvider: data.orderingProvider,
      metrics: data.metrics,
      interfaceType: data.interfaceType,
      file: data.file,
      createdAt: data.createdAt
    });
  });
  
  return requests;
};

export const getRequestById = async (id: string): Promise<Request | null> => {
  const requestDoc = await db.collection('requests').doc(id).get();
  
  if (!requestDoc.exists) {
    return null;
  }
  
  const data = requestDoc.data();
  return {
    id: requestDoc.id,
    labOrderId: data?.labOrderId,
    patientId: data?.patientId,
    labId: data?.labId,
    labTestId: data?.labTestId,
    orderId: data?.orderId,
    orderingProvider: data?.orderingProvider,
    metrics: data?.metrics,
    interfaceType: data?.interfaceType,
    file: data?.file,
    createdAt: data?.createdAt
  };
};

export const getRequestsByLabOrderId = async (labOrderId: string): Promise<Request[]> => {
  const requestsSnapshot = await db.collection('requests')
    .where('labOrderId', '==', labOrderId)
    .get();
  
  const requests: Request[] = [];
  requestsSnapshot.forEach(doc => {
    const data = doc.data();
    requests.push({ 
      id: doc.id, 
      labOrderId: data.labOrderId,
      patientId: data.patientId,
      labId: data.labId,
      labTestId: data.labTestId,
      orderId: data.orderId,
      orderingProvider: data.orderingProvider,
      metrics: data.metrics,
      interfaceType: data.interfaceType,
      file: data.file,
      createdAt: data.createdAt
    });
  });
  
  return requests;
};

export class RequestService {
  static async createRequest(requestData: any) {
    return createRequest(requestData);
  }

  static async getAllRequests() {
    return getAllRequests();
  }

  static async getRequestById(id: string) {
    return getRequestById(id);
  }

  static async getRequestsByLabOrderId(labOrderId: string) {
    return getRequestsByLabOrderId(labOrderId);
  }
}