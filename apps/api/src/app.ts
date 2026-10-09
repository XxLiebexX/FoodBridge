import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger/swagger.json';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { donationRoutes } from './modules/donations/donations.routes';
import { matchingRoutes } from './modules/matching/matching.routes';
import { ngoRoutes } from './modules/ngos/ngos.routes';
import { pickupRoutes } from './modules/pickups/pickups.routes';
import { impactRoutes } from './modules/impact/impact.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { notificationRoutes } from './modules/notifications/notifications.routes';

const app = express();

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Production Health check (with database connectivity test)
app.get('/health', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    await prisma.user.findFirst({ select: { id: true } });
    res.status(200).json({
      status: 'healthy',
      platform: 'FoodBridge AI',
      database: 'connected',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      platform: 'FoodBridge AI',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Central error handler
app.use(errorHandler);

export default app;
