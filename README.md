# ReadyRx Takehome App

A comprehensive lab management system that provides secure patient lab result tracking, historical data visualization, and automated file processing for HL7/FHIR lab data formats. 

## Project Structure

```
readyrx-takehome/
├── frontend/          # React TypeScript app with Tailwind CSS
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── shared/     # Reusable components
│   │   │   ├── PatientProfile.tsx
│   │   │   ├── HistoricalChart.tsx
│   │   │   ├── RecentLabs.tsx
│   │   │   ├── LabOrderForm.tsx
│   │   │   ├── PatientUpload.tsx
│   │   │   ├── TokenManager.tsx
│   │   │   └── ...
│   │   ├── utils/          # Utility functions
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── App.tsx         # Main React component
│   │   └── index.tsx       # React entry point
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
├── backend/           # Express TypeScript server with Firestore
│   ├── src/
│   │   ├── modules/        # Domain-driven modules
│   │   │   ├── patient/    # Patient management (routes, services)
│   │   │   ├── labs/       # Lab entities
│   │   │   ├── labTests/   # Lab test definitions
│   │   │   ├── metrics/    # Metric measurements
│   │   │   ├── labOrders/  # Lab order workflow
│   │   │   ├── results/    # Patient results aggregation
│   │   │   ├── parsers/    # HL7/FHIR file processing
│   │   │   ├── requests/   # Lab request file management
│   │   │   └── health/     # Health check endpoints
│   │   ├── shared/         # Shared utilities and services
│   │   │   ├── auth/       # JWT API token authentication
│   │   │   ├── audit/      # Comprehensive audit logging
│   │   │   ├── encryption/ # AES-256-CBC data encryption
│   │   │   └── middleware/ # Security, rate limiting, CORS
│   │   ├── seeding/        # Database seeding scripts
│   │   ├── scripts/        # Utility scripts
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # Main router
│   │   └── server.ts       # Express server with HTTPS support
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
├── package.json            # Root package.json for scripts
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
- Start Backend server (HTTPS on port 3001, HTTP fallback on 3002)
- Start Frontend React app (on port 3000)
- Seed the database with test data and API tokens

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: https://localhost:3001 (HTTPS) or http://localhost:3002 (HTTP)
- **Firebase Emulator UI**: http://localhost:4000

### 4. Authentication
The application uses JWT-based API token authentication. Pre-seeded tokens are available:

**Admin Token** (Full Access):

Use this token in the frontend Token Manager or add to API requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" https://localhost:3001/api/patients
```

### Individual Service Commands
```bash
npm run emulator    # Start Firebase Emulator only
npm run backend     # Start backend server only  
npm run frontend    # Start frontend only
```


## Database Schema

The application uses a domain-driven design with comprehensive audit logging and data encryption. All sensitive data is encrypted using AES-256-CBC encryption.

### **Core Entities**

#### **Patient**
```typescript
interface Patient {
  id: string;
  name: string;           // Encrypted
  email: string;          // Encrypted
  insurance: string;      // Encrypted
  createdAt: Date;
}
```

#### **Lab**
```typescript
interface Lab {
  id: string;
  name: string;
  interfaceType: 'HL7' | 'FHIR' | 'JSON';
  createdAt: Date;
}
```

#### **Metric** (Lab Test Measurements)
```typescript
interface Metric {
  id: string;
  name: string;           // Stored unencrypted for performance
  result: MetricResult;   // Flexible JSON structure
  units?: string;         // Optional units (mg/dL, U/L, etc.)
  createdAt: Date;
}

type MetricResult = {
  type: 'numeric' | 'range' | 'descriptor' | 'complex';
  value: number | string | boolean;
  status?: 'normal' | 'high' | 'low' | 'critical';
  referenceRange?: string;
}
```

#### **LabTest**
```typescript
interface LabTest {
  id: string;
  name: string;
  metricIds: string[];    // References to Metrics
  codes: string[];        // LOINC codes for lab tests
  createdAt: Date;
}
```
*Pre-seeded with CMP (Comprehensive Metabolic Panel) and CBC (Complete Blood Count) with LOINC codes*

#### **LabOrder**
```typescript
interface LabOrder {
  id: string;
  name: string;
  patientId: string;      // References Patient
  orderId: number;        // For aggregation (multiple orders can share same orderId)
  labId: string;          // References Lab
  labName: string;        // Denormalized for performance
  labTestId: string;      // References LabTest (single test per order)
  status: 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';
  orderingProvider: string;
  orderedDate: Date;
  inProgressDate?: Date;
  completedDate?: Date;
  cancelledDate?: Date;
  createdAt: Date;
}
```

#### **PatientResult** (Aggregated Lab Results)
```typescript
interface PatientResult {
  id: string;
  patientId: string;      // References Patient
  metricId: string;       // References Metric
  metricName: string;     // Stored unencrypted for performance
  result: MetricResult;   // Flexible result structure
  labOrderId: string;     // References LabOrder
  labTestId: string;      // References LabTest
  labId: string;          // References Lab
  labName: string;        // Denormalized for performance
  orderId: number;        // For aggregation
  orderingProvider: string;
  resultDate: Date;
  createdAt: Date;
}
```

#### **Request** (Lab Request Files)
```typescript
interface Request {
  id: string;
  labOrderId: string;     // References LabOrder
  patientId: string;      // References Patient
  labId: string;          // References Lab
  labTestId: string;      // References LabTest
  orderId: number;        // For aggregation
  orderingProvider: string;
  metrics: string[];      // Metric names
  interfaceType: 'HL7' | 'FHIR' | 'JSON';
  file: string;           // Generated request file content
  createdAt: Date;
}
```

### **Security & Audit Entities**

#### **ApiToken** (JWT-based Authentication)
```typescript
interface ApiToken {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'lab_tech' | 'patient';
  permissions: string[];   // Granular permissions
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}
```

#### **AuditLog** (Comprehensive Activity Tracking)
```typescript
interface AuditLog {
  id: string;
  userId: string;         // User who performed the action
  action: string;          // Action performed (e.g., 'create_lab_order')
  resource: string;        // Resource type (e.g., 'lab_order')
  resourceId: string;      // Specific resource ID
  success: boolean;        // Whether action succeeded
  timestamp: Date;         // When action occurred
  details: {               // Additional context
    method: string;        // HTTP method
    url: string;           // API endpoint
    statusCode: number;    // HTTP status code
    userAgent: string;     // Client user agent
    patientId?: string;    // Patient-specific actions
    orderingProvider?: string; // Lab order context
    // ... other contextual data
  };
}
```

## Frontend Application

The React frontend provides a comprehensive lab management interface with modern UI/UX and robust functionality:

### **Patient Management**
- **Patient Profile View**: Displays patient information, insurance details, and member since date
- **Patient List**: Browse and select patients from a paginated list
- **Patient Creation**: Add new patients with form validation

### **Lab Order Management**
- **Recent Labs Sidebar**: Paginated view (10 results per page) of recent lab orders with status indicators
- **Lab Order Creation**: Create new lab orders with multiple lab tests using intuitive form
- **Order Status Tracking**: Visual status indicators (Ordered, In Progress, Completed, Cancelled)

### **Lab Results Visualization**
- **Historical Charts**: Interactive line charts showing metric trends over time using Recharts
- **Metric Filtering**: Dropdown and button-based filtering to select specific metrics
- **Data Summary**: Latest value, average, and range statistics for each metric
- **Accurate Data Display**: All data points shown, even those on the same date

### **File Upload & Processing**
- **Drag & Drop Upload**: Support for HL7, FHIR, and JSON lab result files
- **Auto-Detection**: Automatically detects file format (HL7 vs FHIR)
- **Order ID Extraction**: Parses existing order IDs from uploaded files
- **Result Processing**: Converts uploaded files into patient results and updates lab orders
- **Smart Processing**: Prevents duplicate processing of completed orders

### **Data Integration**
- **Real-time Updates**: Automatic refresh of data after uploads and changes
- **Date Handling**: Proper conversion of Firestore timestamps to JavaScript dates
- **Error Handling**: User-friendly error messages and loading states
- **API Integration**: RESTful API calls with proper error handling
- **Dynamic Server Detection**: Automatically detects and uses HTTPS (3001) or HTTP (3002) backend

### **User Experience**
- **Fixed Layout**: Patient header stays fixed while content scrolls
- **Loading States**: Spinner indicators during data fetching
- **Status Colors**: Color-coded status indicators for quick visual reference
- **Responsive Grid**: Adaptive layout that works on different screen sizes


### **Security & Authentication**
- **API Token Management**: Component in the sidebar to manage API tokens
- **JWT Authentication**: Secure JWT-based API token authentication
- **Token Persistence**: Tokens are stored and automatically used for API calls

## Backend Features

### **Core Architecture**
- **Modular Architecture**: Domain-driven design with separate modules for each entity
- **TypeScript**: Full TypeScript implementation for type safety
- **Express Server**: RESTful API with comprehensive error handling
- **Firebase Integration**: Firestore database with emulator support for development

### **Lab Data Processing**
- **HL7 Parser**: Complete HL7 v2.x message parsing for lab results
- **FHIR Parser**: FHIR R4 resource parsing for lab results and orders
- **Auto-Detection**: Automatic file format detection (HL7 vs FHIR)
- **Order ID Extraction**: Parses order IDs from multiple sources (OBR-2, OBR-3, ServiceRequest, etc.)
- **Request Generation**: Automatic generation of lab request files in appropriate formats
- **Smart Processing**: Prevents duplicate processing of completed orders

### **Security & Compliance**
- **JWT Authentication**: Secure API token-based authentication
- **Data Encryption**: AES-256-CBC encryption for sensitive patient and lab data
- **Rate Limiting**: Protection against brute-force attacks and API abuse
- **Security Headers**: Helmet.js for comprehensive HTTP security headers
- **CORS Support**: Configurable cross-origin requests for frontend integration

### **Audit & Monitoring**
- **Universal Audit Logging**: Comprehensive logging of all API interactions
- **Activity Tracking**: Detailed audit trails with user context and resource information
- **Performance Monitoring**: Request logging and error tracking
- **Compliance Ready**: Audit logs suitable for healthcare compliance requirements

### **Database Management**
- **Database Seeding**: Pre-populated test data for immediate testing
- **Migration Support**: Easy database schema updates and migrations
- **Emulator Support**: Local Firebase emulator for development
- **Production Ready**: Seamless transition to production Firebase

### **API Features**
- **RESTful Design**: Clean, consistent API endpoints
- **Error Handling**: Comprehensive error handling with detailed logging
- **Response Formatting**: Consistent API response structure
- **File Upload Support**: Multipart file upload with validation

## API Endpoints

The application provides comprehensive RESTful APIs with JWT authentication:

### **Authentication Endpoints**
- `GET /api/auth/info` - Get current user information
- `POST /api/auth/tokens` - Create new API token
- `GET /api/auth/tokens` - List user's API tokens
- `DELETE /api/auth/tokens/:id` - Delete specific API token

### **Core Entity Endpoints**
- **Health**: `GET /api/health` - System health check
- **Patients**: `GET|POST /api/patients`, `GET|PUT|DELETE /api/patients/:id`
- **Labs**: `GET|POST /api/labs`, `GET|PUT|DELETE /api/labs/:id`
- **Metrics**: `GET|POST /api/metrics`, `GET|PUT|DELETE /api/metrics/:id`
- **Lab Tests**: `GET|POST /api/lab-tests`, `GET|PUT|DELETE /api/lab-tests/:id`
- **Lab Orders**: `GET|POST /api/lab-orders`, `GET|PUT|DELETE /api/lab-orders/:id`
- **Results**: `GET|POST /api/results`, `GET|PUT|DELETE /api/results/:id`
- **Requests**: `GET /api/requests`, `GET /api/requests/:id` (read-only)

### **Specialized Endpoints**
- **Lab Orders**: `POST /api/lab-orders/multiple` - Create multiple lab orders with same orderId
- **Results Filtering**: `GET /api/results?patientId={id}&metricName={name}` - Filter by patient and metric
- **Request Files**: `GET /api/requests/lab-order/{labOrderId}` - Get request files for specific lab order

### **File Processing Endpoints**
- **File Upload**: `POST /api/parsers/parse` - Upload and parse HL7/FHIR lab result files
- **File Processing**: Automatic order ID extraction and result processing
- **Format Support**: HL7 v2.x, FHIR R4, and JSON formats

### **Security Features**
- **JWT Authentication**: All endpoints require valid API token
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Audit Logging**: All API interactions are logged with full context

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

### **Database Management**
- `npm run update-tokens` - Clears and recreates API tokens in Firestore
- `npm run seed` - Seed database with test data (run from backend directory)
- `npm run clear-db` - Clear all database collections (run from backend directory)

## Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Axios** - HTTP client for API communication
- **Recharts** - Data visualization library for charts and graphs

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **TypeScript** - Type-safe server-side development
- **Firebase Admin SDK** - Database and authentication services
- **JWT** - JSON Web Token authentication
- **AES-256-CBC** - Data encryption for sensitive information

### **Database & Infrastructure**
- **Google Firestore** - NoSQL document database
- **Firebase Emulator** - Local development environment
- **HTTPS/SSL** - Secure communication with self-signed certificates

### **Security & Compliance**
- **Helmet.js** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **Universal Audit Logging** - Comprehensive activity tracking
 