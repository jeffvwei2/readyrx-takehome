# ReadyRx Takehome App

A full-stack TypeScript application built with React + Tailwind CSS frontend, Node.js + Express backend, and Firestore database.

## Project Structure

```
readyrx-takehome/
├── frontend/          # React TypeScript app with Tailwind CSS
│   ├── src/
│   │   ├── App.tsx    # Main React component
│   │   ├── index.tsx  # React entry point
│   │   ├── types.ts   # TypeScript type definitions
│   │   └── ...
│   ├── tsconfig.json  # TypeScript configuration
│   └── package.json
├── backend/           # Express TypeScript server with Firestore
│   ├── src/
│   │   ├── modules/   # Domain-driven modules
│   │   │   ├── patient/     # Patient management
│   │   │   ├── labs/        # Lab entities
│   │   │   ├── labTests/    # Lab test definitions
│   │   │   ├── metrics/     # Metric measurements
│   │   │   ├── labOrders/   # Lab order workflow
│   │   │   ├── results/     # Patient results aggregation
│   │   │   └── health/      # Health check endpoints
│   │   ├── shared/     # Shared utilities and types
│   │   ├── config/     # Configuration files
│   │   ├── routes/     # Main router
│   │   └── server.ts   # Express server
│   ├── tsconfig.json # TypeScript configuration
│   └── package.json
├── package.json       # Root package.json for scripts
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
4. Copy `backend/env.example` to `backend/.env`
5. Fill in your Firebase credentials in `backend/.env`:
   ```
   PORT=5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   ```

### 3. Run the Application

```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

## Entity Structure

The application follows a domain-driven design with the following core entities:

### **Patient**
```typescript
interface Patient {
  id: string;
  name: string;
  email: string;
  insurance: string;
  createdAt: Date;
}
```

### **Lab**
```typescript
interface Lab {
  id: string;
  name: string;
  interfaceType: 'HL7' | 'FHIR' | 'JSON';
  createdAt: Date;
}
```
*Pre-seeded with: Quest Diagnostics (HL7), LabCorp (FHIR)*

### **Metric**
```typescript
interface Metric {
  id: string;
  name: string;
  result: string | number | boolean;
  createdAt: Date;
}
```

### **LabTest**
```typescript
interface LabTest {
  id: string;
  name: string;
  metricIds: string[];  // References to Metrics
  createdAt: Date;
}
```

### **LabOrder**
```typescript
interface LabOrder {
  id: string;
  name: string;
  patientId: string;     // References Patient
  orderId: number;      // For aggregation
  labId: string;        // References Lab
  labTestId: string;    // References LabTest (single test per order)
  status: 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';
  orderingProvider: string;
  orderedDate: Date;
  inProgressDate?: Date;
  completedDate?: Date;
  cancelledDate?: Date;
  createdAt: Date;
}
```

### **PatientResult**
```typescript
interface PatientResult {
  id: string;
  patientId: string;     // References Patient
  metricId: string;      // References Metric
  metricName: string;     // Denormalized for performance
  result: string | number | boolean;
  labOrderId: string;    // References LabOrder
  labTestId: string;     // References LabTest
  labId: string;         // References Lab
  labName: string;       // Denormalized for performance
  orderId: number;       // For aggregation
  orderingProvider: string;
  resultDate: Date;
  createdAt: Date;
}
```

## Architectural Decision: Results Entity vs Query-Based Approach

### **Why We Chose a Dedicated Results Entity**

When designing patient metric aggregation, we evaluated two approaches:

#### **Option 1: Query-Based Approach**
```typescript
// Would require complex joins across collections:
// LabOrders → LabTests → Metrics → Patients
const patientResults = await db.collection('labOrders')
  .where('patientId', '==', patientId)
  .where('status', '==', 'Completed')
  .get()
  .then(orders => {
    // Then query each lab test for metrics
    // Then query each metric for results
    // Complex aggregation logic repeated in every query
  });
```

#### **Option 2: Dedicated Results Entity (Chosen)**
```typescript
// Simple, fast patient-centric queries:
const patientResults = await db.collection('patientResults')
  .where('patientId', '==', patientId)
  .orderBy('resultDate', 'desc')
  .get();
```

### **Benefits of the Results Entity Approach:**

1. **Performance**: Pre-aggregated data eliminates complex joins across multiple collections
2. **Historical Tracking**: Built-in timeline functionality with optimized date-based queries
3. **Flexible Querying**: Easy filtering by patient, metric, date ranges, labs, providers
4. **Data Integrity**: Single source of truth for patient results with denormalized key fields
5. **Scalability**: Optimized for patient-centric operations that will be frequent
6. **Query Simplicity**: Simple, readable queries instead of complex aggregation logic
7. **Caching Benefits**: Results can be easily cached and invalidated
8. **Analytics Ready**: Pre-structured data perfect for trend analysis and reporting

### **Trade-offs:**
- **Storage**: Additional storage for denormalized data (acceptable given performance gains)
- **Consistency**: Requires maintaining data consistency when source entities change
- **Complexity**: Additional service to populate results from lab orders

The Results entity approach provides the best balance of performance, maintainability, and user experience for patient-centric metric queries.

## Features

- **Frontend**: React app with Tailwind CSS for styling
- **Backend**: Express server with CORS enabled
- **Database**: Firestore integration for data persistence
- **Modular Architecture**: Domain-driven design with separate modules for each entity
- **Patient-Centric Results**: Aggregated results with historical tracking
- **Lab Order Workflow**: Complete lab order management with status tracking
- **Flexible Metrics**: Support for various metric types (string, number, boolean)

## API Endpoints

The application provides RESTful APIs for all entities:

- **Health**: `/api/health` - System health check
- **Patients**: `/api/patients` - Patient management (CRUD)
- **Labs**: `/api/labs` - Lab management (CRUD)
- **Metrics**: `/api/metrics` - Metric management (CRUD)
- **Lab Tests**: `/api/lab-tests` - Lab test management (CRUD)
- **Lab Orders**: `/api/lab-orders` - Lab order workflow (CRUD)
- **Results**: `/api/results` - Patient results aggregation

### Specialized Result Queries
- `GET /api/results/patient/:patientId` - All results for a patient
- `GET /api/results/patient/:patientId/summary` - Patient results summary
- `GET /api/results/patient/:patientId/metric/:metricId/history` - Historical data for specific metric
- `GET /api/results/patient/:patientId/date-range` - Results within date range

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only the backend
- `npm run client` - Start only the frontend
- `npm run install-all` - Install all dependencies

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Axios
- **Backend**: Node.js, Express, TypeScript, Firebase Admin SDK
- **Database**: Google Firestore
- **Development**: Concurrently for running multiple processes, ts-node-dev for TypeScript development
