import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from '@modules/auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountModule } from './modules/account/account.module';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE_TCP',
        transport: Transport.TCP,
        options: {
          host: 'auth-service',
          port: 4000,
        },
      },
    ]),
    ClsModule.forRoot({
      global: true,                // <– makes ClsService available everywhere
      middleware: {
        mount: true,               // <– wraps every HTTP request in a CLS context
        // optional setup if you want to pre-fill something from req:
        // setup: (cls, req) => {
        //   cls.set('requestId', req.headers['x-request-id']);
        // },
      },
    }),
    CacheModule.register({ isGlobal: true }),
    EventEmitterModule.forRoot({ global: true }),
    AuthModule,
    AccountModule
  ],
})
export class AppModule {}
