# ReadyRx Backend

A comprehensive lab management system backend built with Node.js, Express, TypeScript, and Firebase Firestore. This backend provides secure APIs for patient management, lab order processing, and HL7/FHIR file parsing with comprehensive audit logging and data encryption.

## Architecture

### **Domain-Driven Design**
The backend follows a modular, domain-driven architecture with separate modules for each business entity:

```
src/
├── modules/           # Domain modules
│   ├── patient/      # Patient management
│   ├── labs/         # Lab entities
│   ├── labTests/     # Lab test definitions
│   ├── metrics/      # Metric measurements
│   ├── labOrders/    # Lab order workflow
│   ├── results/      # Patient results aggregation
│   ├── parsers/      # HL7/FHIR file processing
│   ├── requests/     # Lab request file management
│   └── health/        # Health check endpoints
├── shared/           # Shared utilities and services
│   ├── auth/         # JWT API token authentication
│   ├── audit/        # Comprehensive audit logging
│   ├── encryption/    # AES-256-CBC data encryption
│   └── middleware/   # Security, rate limiting, CORS
├── seeding/          # Database seeding scripts
├── scripts/          # Utility scripts
├── config/           # Configuration files
├── routes/           # Main router
└── server.ts         # Express server with HTTPS support
```

## Key Features

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

## API Endpoints

### **Authentication**
- `GET /api/auth/info` - Get current user information
- `POST /api/auth/tokens` - Create new API token
- `GET /api/auth/tokens` - List user's API tokens
- `DELETE /api/auth/tokens/:id` - Delete specific API token

### **Core Entities**
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
- **File Upload**: `POST /api/parsers/parse` - Upload and parse HL7/FHIR lab result files

## Database Schema

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

#### **LabOrder**
```typescript
interface LabOrder {
  id: string;
  name: string;
  patientId: string;      // References Patient
  orderId: number;        // For aggregation
  labId: string;          // References Lab
  labName: string;        // Denormalized for performance
  labTestId: string;      // References LabTest
  status: 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';
  orderingProvider: string;
  orderedDate: Date;
  inProgressDate?: Date;
  completedDate?: Date;
  cancelledDate?: Date;
  createdAt: Date;
}
```

#### **PatientResult**
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

### **Security & Audit Entities**

#### **ApiToken**
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

#### **AuditLog**
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

## Security Features

### **Authentication**
- JWT-based API token authentication
- Role-based access control (admin, doctor, lab_tech, patient)
- Granular permissions system
- Token expiration and revocation

### **Data Protection**
- AES-256-CBC encryption for sensitive data
- Selective encryption (patient names, emails, insurance)
- Backward compatibility for unencrypted data
- Secure key management

### **API Security**
- Rate limiting 
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization

### **Audit & Compliance**
- Universal audit logging for all API interactions
- Detailed activity tracking with user context
- Compliance-ready audit trails
- Performance monitoring and error tracking

## Development

### **Prerequisites**
- Node.js (v16 or higher)
- Java (for Firebase Emulator)
- TypeScript

### **Installation**
```bash
npm install
```

### **Environment Setup**
Create `.env` file:
```env
PORT=3001
USE_EMULATOR=true
FIREBASE_PROJECT_ID=readyrx-takehome
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@readyrx-takehome.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### **Running the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start

# With HTTPS (recommended)
npm run start
```

### **Database Management**
```bash
# Seed database with test data
npm run seed

# Clear all collections
npm run clear-db

# Update API tokens
npm run update-tokens
```

## File Processing

### **Supported Formats**
- **HL7 v2.x**: Complete message parsing with order ID extraction
- **FHIR R4**: Resource parsing for lab results and orders
- **JSON**: Custom format support

### **Processing Features**
- Automatic file format detection
- Order ID extraction from multiple sources
- Result processing and patient result creation
- Lab order status updates
- Duplicate prevention for completed orders

## Testing

### **Test Files**
The system includes comprehensive test files for different scenarios:
- `test-fhir-with-order-id-and-codes.json` - FHIR with order ID and LOINC codes
- `test-fhir-with-codes-only.json` - FHIR with codes but no order ID
- `test-hl7-with-order-id-and-codes.txt` - HL7 with order ID and codes
- `test-hl7-with-codes-only.txt` - HL7 with codes but no order ID

### **API Testing**
```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" https://localhost:3001/api/patients

# Test file upload
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-fhir-with-order-id-and-codes.json" \
  https://localhost:3001/api/parsers/parse
```

## Production Deployment

### **Firebase Setup**
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate service account key
4. Update `.env` with production credentials
5. Set `USE_EMULATOR=false`

### **Security Considerations**
- Use production Firebase credentials
- Implement proper key management
- Configure production CORS settings
- Set up monitoring and alerting
- Regular security audits
