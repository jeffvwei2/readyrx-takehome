# ReadyRx Frontend

A modern React TypeScript frontend for the ReadyRx lab management system. Built with React 18, TypeScript, Tailwind CSS, and Recharts for data visualization. Provides a comprehensive interface for patient management, lab order processing, and result visualization.

## Architecture

### **Component Structure**
```
src/
├── components/           # React components
│   ├── shared/          # Reusable components
│   │   ├── LoadingSpinner.tsx
│   │   └── ...
│   ├── PatientProfile.tsx      # Main patient view
│   ├── HistoricalChart.tsx      # Data visualization
│   ├── RecentLabs.tsx          # Lab order sidebar
│   ├── LabOrderForm.tsx        # Lab order creation
│   ├── PatientUpload.tsx       # File upload component
│   ├── TokenManager.tsx         # API token management
│   ├── MetricsDashboard.tsx    # Metrics and chart container
│   └── ...
├── utils/               # Utility functions
│   ├── serverDetection.ts      # Dynamic backend URL detection
│   └── ...
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main React component
└── index.tsx            # React entry point
```

## Key Features

### **Patient Management**
- **Patient Profile View**: Comprehensive patient information display
- **Patient List**: Browse and select patients from paginated list
- **Patient Creation**: Add new patients with form validation
- **Dynamic Patient Selection**: No longer defaults to seeded patient unless no other patient is selected

### **Lab Order Management**
- **Recent Labs Sidebar**: Paginated view (10 results per page) of recent lab orders
- **Lab Order Creation**: Create new lab orders with multiple lab tests
- **Order Status Tracking**: Visual status indicators (Ordered, In Progress, Completed, Cancelled)
- **Real-time Updates**: Automatic refresh of recent labs when new orders are created

### **Lab Results Visualization**
- **Historical Charts**: Interactive line charts showing metric trends over time
- **Metric Filtering**: Dropdown and button-based filtering to select specific metrics
- **Data Summary**: Latest value, average, and range statistics for each metric
- **Accurate Data Display**: All data points shown, even those on the same date
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

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
- **Optimized Rendering**: Prevents unnecessary re-renders when switching metrics

### **Security & Authentication**
- **API Token Management**: Component in the sidebar to manage API tokens
- **JWT Authentication**: Secure JWT-based API token authentication
- **Token Persistence**: Tokens are stored and automatically used for API calls

## Component Details

### **PatientProfile**
Main patient view component that displays:
- Patient header with basic information
- Recent labs sidebar
- Historical chart with metric filter
- Fixed height with scrollable content

### **HistoricalChart**
Data visualization component using Recharts:
- Interactive line charts for metric trends
- Tooltip with detailed information
- Responsive design for different screen sizes
- Accurate data point display

### **RecentLabs**
Sidebar component for lab order management:
- Paginated view
- Status indicators with color coding
- Navigation arrows for pagination
- Fixed height matching chart area

### **LabOrderForm**
Form component for creating lab orders:
- Patient dropdown selection
- Ordering provider text field
- Multiple lab test selection with plus button
- Form validation and error handling

### **PatientUpload**
File upload component with drag & drop:
- Support for HL7, FHIR, and JSON files
- Automatic file format detection
- Upload progress indicators
- Error handling and user feedback

### **TokenManager**
API token management component:
- Token input and validation
- Token storage and persistence
- Automatic API call authentication
- Token status display

## Data Flow

### **API Communication**
- JWT token authentication
- Axios for HTTP requests
- Error handling and user feedback


### **Data Visualization**
- Recharts for chart rendering
- Metric filtering and selection
- Date formatting and display
- Responsive chart sizing

## Development

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn

### **Installation**
```bash
npm install
```

### **Development Server**
```bash
npm start
```

### **Build for Production**
```bash
npm run build
```

### **Environment Configuration**
The frontend automatically detects the backend server:
- HTTPS: https://localhost:3001
- HTTP: http://localhost:3002

## API Integration

### **Authentication**
All API calls require JWT authentication:
```typescript
const token = localStorage.getItem('apiToken');
const response = await axios.get('/api/patients', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### **Error Handling**
Comprehensive error handling for API calls:
```typescript
try {
  const response = await apiCall();
  // Handle success
} catch (error) {
  // Display user-friendly error message
  setError('Failed to load data. Please try again.');
}
```

### **Data Fetching**
Hooks for data fetching with loading states:
```typescript
const [patients, setPatients] = useState<Patient[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchPatients().then(setPatients).finally(() => setLoading(false));
}, []);
```

## Testing

### **Component Testing**
Test individual components:
```bash
npm test
```

### **API Testing**
Test API integration:
```bash
# Test patient data loading
curl -H "Authorization: Bearer YOUR_TOKEN" https://localhost:3001/api/patients
```

### **File Upload Testing**
Test file upload functionality:
```bash
# Test FHIR file upload
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-fhir-with-order-id-and-codes.json" \
  https://localhost:3001/api/parsers/parse
```
