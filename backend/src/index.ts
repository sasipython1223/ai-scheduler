import express from 'express';
import taskRoutes from './routes/tasks-simple';
import { logger } from './utils/logger';

const app = express();
app.use(express.json());

// Basic health check route
app.get('/api/hello', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({
    message: 'Hello from backend!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  });
});

// Task routes
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📋 API endpoints available at http://localhost:${PORT}/api`);
});
