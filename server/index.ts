import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { registerRoutes } from './routes';
import admin from 'firebase-admin';
import path from 'path';
import serviceAccount from './firebase-service-account.json';
import http from 'http';

// Load environment variables
config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any)
});

const app = express();

// CORS configuration - more permissive for development
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Function to find an available port
const startServer = (port: number) => {
  const server = http.createServer(app);
  
  server.on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', e);
    }
  });

  server.listen(port, () => {
    console.log(`[express] serving on port ${port}`);
  });
};

const PORT = parseInt(process.env.PORT || '5000');
startServer(PORT);
