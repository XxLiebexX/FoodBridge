import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current dir
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'foodbridge_super_secure_access_secret_2026_dev_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'foodbridge_super_secure_refresh_secret_2026_dev_key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8001'
};
