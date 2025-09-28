import { db } from '../../config/firebase';
import { CreatePatientResultRequest } from '../../modules/results/types/resultTypes';

/**
 * Shared utilities for metric operations used across parsers
 */

/**
 * Find metric by name
 */
export const findMetricByName = async (metricName: string): Promise<{ id: string; data: any } | null> => {
  try {
    const metricsSnapshot = await db.collection('metrics')
      .where('name', '==', metricName)
      .get();
    
    if (!metricsSnapshot.empty) {
      const metricDoc = metricsSnapshot.docs[0];
      return {
        id: metricDoc.id,
        data: metricDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error finding metric by name ${metricName}:`, error);
    return null;
  }
};

/**
 * Create patient result from observation data
 */
export const createPatientResultFromObservation = async (
  observation: {
    metricName: string;
    result: any;
    observationDate?: Date;
  },
  labOrderData: any,
  labData: any,
  labOrderId: string,
  labTestId: string,
  labReport: any
): Promise<CreatePatientResultRequest | null> => {
  const metric = await findMetricByName(observation.metricName);
  
  if (!metric) {
    console.warn(`Metric "${observation.metricName}" not found`);
    return null;
  }

  return {
    patientId: labOrderData.patientId,
    metricId: metric.id,
    metricName: observation.metricName,
    result: observation.result,
    labOrderId: labOrderId,
    labTestId: labTestId,
    labId: labOrderData.labId,
    labName: labData?.name || labReport.labName,
    orderId: labOrderData.orderId,
    orderingProvider: labOrderData.orderingProvider,
    resultDate: observation.observationDate || labReport.reportDate
  };
};

/**
 * Create multiple patient results from observations
 */
export const createPatientResultsFromObservations = async (
  observations: Array<{
    metricName: string;
    result: any;
    observationDate?: Date;
  }>,
  labOrderData: any,
  labData: any,
  labOrderId: string,
  labTestId: string,
  labReport: any
): Promise<CreatePatientResultRequest[]> => {
  const results: CreatePatientResultRequest[] = [];
  
  for (const observation of observations) {
    const result = await createPatientResultFromObservation(
      observation,
      labOrderData,
      labData,
      labOrderId,
      labTestId,
      labReport
    );
    
    if (result) {
      results.push(result);
    }
  }
  
  return results;
};

/**
 * Get lab data by ID
 */
export const getLabData = async (labId: string): Promise<any> => {
  try {
    const labDoc = await db.collection('labs').doc(labId).get();
    return labDoc.exists ? labDoc.data() : null;
  } catch (error) {
    console.error(`Error fetching lab data for ${labId}:`, error);
    return null;
  }
};

/**
 * Get lab order data by ID
 */
export const getLabOrderData = async (labOrderId: string): Promise<any> => {
  try {
    const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
    return labOrderDoc.exists ? labOrderDoc.data() : null;
  } catch (error) {
    console.error(`Error fetching lab order data for ${labOrderId}:`, error);
    return null;
  }
};
