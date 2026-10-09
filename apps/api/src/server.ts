import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

const server = app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`🚀 FoodBridge AI API Server Running!`);
  console.log(`📡 Port: ${config.port}`);
  console.log(`📄 Swagger Docs: http://localhost:${config.port}/api/docs`);
  console.log(`🌿 Environment: ${config.nodeEnv}`);
  console.log(`=========================================`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server & database connection...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
export { app, server };
