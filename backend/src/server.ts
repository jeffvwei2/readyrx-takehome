import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { requestLogger, errorHandler } from './shared/middleware';
import { seedAll } from './seeding';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Seed initial data
seedAll();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
