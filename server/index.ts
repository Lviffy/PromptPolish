import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { registerRoutes } from './routes';
import admin from 'firebase-admin';
import path from 'path';
import serviceAccount from './firebase-service-account.json';

// Load environment variables
config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any)
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Default root route
app.get('/', (req, res) => {
  res.send('PromptPolish API is running!');
});

// Routes
registerRoutes(app);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[express] serving on port ${PORT}`);
});
