import helmet from 'helmet';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/exception-filters/all.filter';
import { ENVIRONMENT_VARIABLES } from './common/constants/environment-variables';
import { REDIS_KEYS } from 'connectfy-shared';
import { RedisStore } from 'connect-redis';
import { DeviceIdInterceptor } from './interceptors/deviceId.interceptor';
import { ClsService } from 'nestjs-cls';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const cls = app.get(ClsService);
  const PORT = Number(ENVIRONMENT_VARIABLES.PORT);
  const NODE_ENV = String(ENVIRONMENT_VARIABLES.NODE_ENV);
  const CLIENT_URL = String(ENVIRONMENT_VARIABLES.CLIENT_URL);
  const SESSION_SECRET_KEY = String(ENVIRONMENT_VARIABLES.SESSION_SECRET_KEY);

  const redisClient = app.get(REDIS_KEYS.REDIS_CLIENT);

  const RedisSessionStore = new RedisStore({
    client: {
      get: (key: string) => redisClient.get(key),
      set: (key: string, value: string, options?: { EX?: number }) => {
        if (options?.EX) {
          return redisClient.set(key, value, 'EX', options.EX);
        }
        return redisClient.set(key, value);
      },
      del: (key: string) => redisClient.del(key),
    } as any,
    prefix: 'sess:',
  });

  // Prefix
  app.setGlobalPrefix('/api/v1');

  // Helmet
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-device-id',
      'X-Requested-With',
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204,
  });

  // Cookie Parser
  app.use(cookieParser());

  // Session
  app.use(
    session({
      store: RedisSessionStore,
      name: 'n_sid',
      secret: SESSION_SECRET_KEY ?? 'session-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        domain: NODE_ENV === 'production' ? undefined : undefined,
      },
    }),
  );

  // Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new DeviceIdInterceptor(cls));

  // Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(PORT);

  console.log(`✅ NODE_ENV => `, NODE_ENV);
  console.log(`✅ Server is working on ${PORT} port`);
}
bootstrap();
