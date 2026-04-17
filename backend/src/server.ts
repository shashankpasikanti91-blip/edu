import { app } from './app';
import { env, validateEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './shared/utils/logger';

async function bootstrap(): Promise<void> {
  try {
    validateEnv();
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`${env.APP_NAME} API started`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        url: env.APP_URL,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed gracefully');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
}

bootstrap();
