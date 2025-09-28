import { db } from '../../../config/firebase';
import { RequestService } from '../../requests/services/requestService';

export interface RequestFileData {
  labOrderId: string;
  patientId: string;
  labId: string;
  labTestId: string;
  orderId: number;
  orderingProvider: string;
  metrics: string[];
}

export const generateRequestFile = async (labOrderId: string): Promise<string> => {
  try {
    // Get lab order data
    const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
    if (!labOrderDoc.exists) {
      throw new Error('Lab order not found');
    }
    
    const labOrderData = labOrderDoc.data();
    
    // Get lab data to determine interface type
    const labDoc = await db.collection('labs').doc(labOrderData?.labId).get();
    if (!labDoc.exists) {
      throw new Error('Lab not found');
    }
    
    const labData = labDoc.data();
    const interfaceType = labData?.interfaceType || 'HL7'; // Default to HL7
    
    // Get lab test data
    const labTestDoc = await db.collection('labTests').doc(labOrderData?.labTestId).get();
    if (!labTestDoc.exists) {
      throw new Error('Lab test not found');
    }
    
    const labTestData = labTestDoc.data();
    
    // Get metrics for the lab test
    const metrics: string[] = [];
    if (labTestData?.metricIds) {
      for (const metricId of labTestData.metricIds) {
        const metricDoc = await db.collection('metrics').doc(metricId).get();
        if (metricDoc.exists) {
          const metricData = metricDoc.data();
          metrics.push(metricData?.name || '');
        }
      }
    }
    
    // Get patient data
    const patientDoc = await db.collection('patients').doc(labOrderData?.patientId).get();
    const patientData = patientDoc.data();
    
    const requestData: RequestFileData = {
      labOrderId,
      patientId: labOrderData?.patientId,
      labId: labOrderData?.labId,
      labTestId: labOrderData?.labTestId,
      orderId: labOrderData?.orderId,
      orderingProvider: labOrderData?.orderingProvider,
      metrics
    };
    
    // Generate file content based on interface type
    let fileContent: string;
    
    if (interfaceType === 'FHIR') {
      fileContent = generateFHIRRequest(requestData, patientData, labData, labTestData);
    } else {
      fileContent = generateHL7Request(requestData, patientData, labData, labTestData);
    }
    
    // Create request record in database
    const requestRecord = {
      labOrderId,
      patientId: labOrderData?.patientId,
      labId: labOrderData?.labId,
      labTestId: labOrderData?.labTestId,
      orderId: labOrderData?.orderId,
      orderingProvider: labOrderData?.orderingProvider,
      metrics,
      interfaceType,
      file: fileContent
    };
    
    const requestId = await RequestService.createRequest(requestRecord);
    
    console.log(`Generated ${interfaceType} request record: ${requestId}`);
    return requestId;
    
  } catch (error) {
    console.error('Error generating request file:', error);
    throw error;
  }
};

const generateFHIRRequest = (
  requestData: RequestFileData, 
  patientData: any, 
  labData: any, 
  labTestData: any
): string => {
  const now = new Date().toISOString();
  
  const fhirBundle = {
    "resourceType": "Bundle",
    "id": `lab-order-${requestData.orderId}`,
    "type": "message",
    "timestamp": now,
    "entry": [
      {
        "resource": {
          "resourceType": "MessageHeader",
          "id": `msg-${requestData.orderId}`,
          "event": {
            "system": "http://hl7.org/fhir/message-events",
            "code": "lab-order"
          },
          "destination": [
            {
              "name": labData?.name || "Lab",
              "endpoint": "https://lab.example.com/fhir"
            }
          ],
          "sender": {
            "reference": "Organization/ordering-org"
          },
          "source": {
            "name": "ReadyRx System",
            "endpoint": "https://readyrx.example.com/fhir"
          }
        }
      },
      {
        "resource": {
          "resourceType": "Patient",
          "id": requestData.patientId,
          "identifier": [
            {
              "use": "usual",
              "type": {
                "coding": [
                  {
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                    "code": "MR",
                    "display": "Medical Record Number"
                  }
                ]
              },
              "value": patientData?.id || requestData.patientId
            }
          ],
          "name": [
            {
              "use": "official",
              "family": patientData?.lastName || "Doe",
              "given": [patientData?.firstName || "John"]
            }
          ],
          "gender": patientData?.gender || "unknown",
          "birthDate": patientData?.dateOfBirth || "1990-01-01"
        }
      },
      {
        "resource": {
          "resourceType": "ServiceRequest",
          "id": `service-${requestData.orderId}`,
          "identifier": [
            {
              "use": "usual",
              "value": requestData.orderId.toString()
            }
          ],
          "status": "active",
          "intent": "order",
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": labTestData?.codes?.[0] || "33747-0",
                "display": labTestData?.name || "Lab Test"
              }
            ]
          },
          "subject": {
            "reference": `Patient/${requestData.patientId}`
          },
          "requester": {
            "reference": "Practitioner/ordering-provider",
            "display": requestData.orderingProvider
          },
          "authoredOn": now
        }
      }
    ]
  };
  
  return JSON.stringify(fhirBundle, null, 2);
};

const generateHL7Request = (
  requestData: RequestFileData, 
  patientData: any, 
  labData: any, 
  labTestData: any
): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];
  
  // MSH - Message Header
  const msh = `MSH|^~\\&|ReadyRx|ReadyRxSystem|${labData?.name || 'Lab'}|LabSystem|${timestamp}||OML^O21^OML_O21|${requestData.orderId}|P|2.5.1||||||UNICODE UTF-8`;
  
  // PID - Patient Identification
  const pid = `PID|1||${requestData.patientId}^^^MR||${patientData?.firstName || 'John'}^${patientData?.lastName || 'Doe'}||${patientData?.dateOfBirth || '19900101'}|${patientData?.gender || 'U'}`;
  
  // OBR - Observation Request
  const obr = `OBR|1|${requestData.orderId}||${labTestData?.codes?.[0] || '33747-0'}^${labTestData?.name || 'Lab Test'}|||${timestamp}|||||||||${requestData.orderingProvider}|||||||${timestamp}|||F`;
  
  // OBX - Observation/Result (for each metric)
  const obxSegments = requestData.metrics.map((metric, index) => {
    return `OBX|${index + 1}|NM|${metric}|||^|||||F||||||${timestamp}`;
  }).join('\n');
  
  return [msh, pid, obr, obxSegments].join('\n');
};
