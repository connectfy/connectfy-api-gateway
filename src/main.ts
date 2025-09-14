import helmet from 'helmet';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './exception-filters/all.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = Number(process.env.PORT);
  const NODE_ENV = String(process.env.NODE_ENV);
  const CLIENT_URL = String(process.env.CLIENT_URL);
  const SESSION_SECRET_KEY = String(process.env.SESSION_SECRET_KEY);

  // Prefix
  app.setGlobalPrefix('/api');

  // Helmet
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Cookie Parser
  app.use(cookieParser());

  // Session
  app.use(
    session({
      name: 'n_sid',
      secret: SESSION_SECRET_KEY ?? 'session-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV !== 'production',
        sameSite: NODE_ENV === 'production' ? 'lax' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        domain: NODE_ENV === 'production' ? undefined : undefined,
      },
    }),
  );

  // Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(PORT);

  console.log(`✅ NODE_ENV => `, NODE_ENV);
  console.log(`✅ Server is working on ${PORT} port`);
}
bootstrap();
