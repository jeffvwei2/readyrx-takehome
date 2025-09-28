# ReadyRx Takehome App

This app provides lab results for patients who can then track their historical results per metric/biomarker. 

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

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Java (for Firebase Emulator)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start Everything
```bash
npm run start
```

This single command will:
- Start Firebase Emulator (Firestore on port 8080)
- Start Backend server (Express on port 3001)
- Start Frontend React app (on port 3000)
- Seed the database with test data

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Firebase Emulator UI**: http://localhost:4000

### Individual Service Commands
```bash
npm run emulator    # Start Firebase Emulator only
npm run backend     # Start backend server only  
npm run frontend    # Start frontend only
```

### Production Setup (Optional)
For production deployment with real Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key and create `backend/.env`:
   ```
   PORT=3001
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   ```
4. Set `USE_EMULATOR=false` in `backend/.env`

## Database Schema

The application uses a domain-driven design with the following core entities:

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

### **Metric (aka Biomarkers) ** 
```typescript
interface Metric {
  id: string;
  name: string;
  result: MetricResult;  // Flexible JSON structure
  units?: string;        // Optional units (mg/dL, U/L, etc.)
  createdAt: Date;
}

type MetricResult = // common possible metric types
  | NumericResult 
  | RangeResult 
  | DescriptorResult 
  | ComplexResult 
  | ArrayResult 
  | BooleanResult
  | number | string | boolean;  // Simple values
```

### **LabTest**
```typescript
interface LabTest {
  id: string;
  name: string;
  metricIds: string[];  // References to Metrics
  codes: string[];      // LOINC codes
  createdAt: Date;
}
```
*Pre-seeded with generic CMP (Comprehensive Metabolic Panel), CBC (Complete Blood Count) *

### **LabOrder**
```typescript
interface LabOrder {
  id: string;
  name: string;
  patientId: string;     // References Patient
  orderId: number;      // For aggregation (multiple orders can share same orderId)
  labId: string;        // References Lab
  labName: string;      // Denormalized for performance
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
  result: MetricResult;   // Flexible result structure
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

### **Request** (Lab Request Files)
```typescript
interface Request {
  id: string;
  labOrderId: string;    // References LabOrder
  patientId: string;    // References Patient
  labId: string;        // References Lab
  labTestId: string;    // References LabTest
  orderId: number;      // For aggregation
  orderingProvider: string;
  metrics: string[];    // Metric names
  interfaceType: 'HL7' | 'FHIR' | 'JSON';
  file: string;         // Generated request file content
  createdAt: Date;
}
```

## Frontend Application

The React frontend provides a comprehensive lab management interface with the following key features:

### **Patient Management**
- **Patient Profile View**: Displays patient information, insurance details, and member since date
- **Patient List**: Browse and select patients from a paginated list
- **Patient Creation**: Add new patients with form validation

### **Lab Order Management**
- **Recent Labs Sidebar**: Paginated view of recent lab orders with status indicators
- **Lab Order Creation**: Create new lab orders with multiple lab tests
- **Order Status Tracking**: Visual status indicators (Ordered, In Progress, Completed, Cancelled)

### **Lab Results Visualization**
- **Historical Charts**: Interactive line charts showing metric trends over time using Recharts
- **Metric Filtering**: Dropdown and button-based filtering to select specific metrics
- **Data Summary**: Latest value, average, and range statistics for each metric
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### **File Upload & Processing**
- **Drag & Drop Upload**: Support for HL7, FHIR, and JSON lab result files
- **Auto-Detection**: Automatically detects file format (HL7 vs FHIR)
- **Order ID Extraction**: Parses existing order IDs from uploaded files
- **Result Processing**: Converts uploaded files into patient results and updates lab orders

### **Data Integration**
- **Real-time Updates**: Automatic refresh of data after uploads and changes
- **Date Handling**: Proper conversion of Firestore timestamps to JavaScript dates
- **Error Handling**: User-friendly error messages and loading states
- **API Integration**: RESTful API calls with proper error handling

### **User Experience**
- **Fixed Layout**: Patient header stays fixed while content scrolls
- **Loading States**: Spinner indicators during data fetching
- **Status Colors**: Color-coded status indicators for quick visual reference
- **Responsive Grid**: Adaptive layout that works on different screen sizes

## Backend Features

- **Modular Architecture**: Domain-driven design with separate modules for each entity
- **Lab Data Parsing**: HL7 and FHIR parsers for processing lab result files
- **Request Generation**: Automatic generation of lab request files in appropriate formats
- **Database Seeding**: Pre-populated test data for immediate testing
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Error Handling**: Comprehensive error handling with detailed logging

## API Endpoints

The application provides RESTful APIs for all entities:

### **Core CRUD Endpoints**
- **Health**: `GET /api/health` - System health check
- **Patients**: `GET|POST /api/patients` - Patient management
- **Labs**: `GET|POST /api/labs` - Lab management  
- **Metrics**: `GET|POST /api/metrics` - Metric management
- **Lab Tests**: `GET|POST /api/lab-tests` - Lab test management
- **Lab Orders**: `GET|POST /api/lab-orders` - Lab order management
- **Results**: `GET|POST /api/results` - Patient results management
- **Requests**: `GET /api/requests` - Lab request files (read-only)

### **Specialized Endpoints**
- **Lab Orders**: `POST /api/lab-orders/multiple` - Create multiple lab orders with same orderId
- **Results**: `GET /api/results?patientId={id}&metricName={name}` - Filter results by patient and metric
- **Requests**: `GET /api/requests/lab-order/{labOrderId}` - Get request files for specific lab order

### **File Processing**
- **Parsers**: `POST /api/parsers/parse` - Parse HL7/FHIR lab result files
- **File Upload**: `POST /api/parsers/upload` - Upload and process lab result files

## Available Scripts

### **Root Level Commands**
- `npm run start` - Start all services (emulator, backend, frontend)
- `npm run install-all` - Install dependencies for all projects
- `npm run emulator` - Start Firebase Emulator only
- `npm run backend` - Start backend server only
- `npm run frontend` - Start frontend only

### **Development Commands**
- `npm run dev` - Start both frontend and backend (legacy)
- `npm run server` - Start only the backend (legacy)
- `npm run client` - Start only the frontend (legacy)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Axios
- **Backend**: Node.js, Express, TypeScript, Firebase Admin SDK
- **Database**: Google Firestore
 