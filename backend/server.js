import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ariaRoutes from './routes/aria.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Signal87 Backend',
    agent: 'Aria',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/aria', ariaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Signal87 Backend running on port ${PORT}`);
  console.log(`🤖 Aria AI Platform API ready`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
