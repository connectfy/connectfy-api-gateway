import * as dotenv from 'dotenv';
import * as path from 'path';

const appEnv = process.env.APP_ENV || 'remote';

const envPath = path.resolve(process.cwd(), `.env.${appEnv}`);

dotenv.config({ path: envPath });

export const ENVIRONMENT_VARIABLES = {
  // Core
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  // Session and CORS
  CLIENT_URL: process.env.CLIENT_URL,
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,

  // Kafka
  SERVICE_NAME: process.env.SERVICE_NAME,
  BROKER1: process.env.BROKER1 || '',
  BROKER2: process.env.BROKER2 || '',

  // TCP
  AUTH_SERVICE_HOST: process.env.AUTH_SERVICE_HOST,
  AUTH_SERVICE_PORT: Number(process.env.AUTH_SERVICE_PORT),

  ACCOUNT_SERVICE_HOST: process.env.ACCOUNT_SERVICE_HOST,
  ACCOUNT_SERVICE_PORT: Number(process.env.ACCOUNT_SERVICE_PORT),

  MESSENGER_SERVICE_HOST: process.env.MESSENGER_SERVICE_HOST,
  MESSENGER_SERVICE_PORT: Number(process.env.MESSENGER_SERVICE_PORT),

  RELATIONSHIP_SERVICE_HOST: process.env.RELATIONSHIP_SERVICE_HOST,
  RELATIONSHIP_SERVICE_PORT: Number(process.env.RELATIONSHIP_SERVICE_PORT),

  NOTIFICATION_ACTION_HISTORY_SERVICE_HOST:
    process.env.NOTIFICATION_ACTION_HISTORY_SERVICE_HOST,
  NOTIFICATION_ACTION_HISTORY_SERVICE_PORT: Number(
    process.env.NOTIFICATION_ACTION_HISTORY_SERVICE_PORT,
  ),
};
