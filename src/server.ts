import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { initSchema } from './config/db';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// High performance middlewares
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files (storage directory)
const storagePath = path.join(__dirname, '..', 'storage');
app.use('/storage', express.static(storagePath));

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ABR Greens Backend'
  });
});

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('ABR Greens Real Estate API Server is running.');
});

// Start server
async function startServer() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 ABR Greens Backend running on port ${PORT}`);
      console.log(`📡 API Base:   http://localhost:${PORT}/api/`);
      console.log(`🖼️  Storage:    http://localhost:${PORT}/storage/`);
      console.log(`🩺 Health:     http://localhost:${PORT}/health`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
