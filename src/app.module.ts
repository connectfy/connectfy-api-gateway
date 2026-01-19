import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from '@modules/auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountModule } from '@modules/account/account.module';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';
import { MICROSERVICE_NAMES } from '@common/constants/constants';
import { AppCacheModule } from '@modules/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: MICROSERVICE_NAMES.AUTH.TCP,
        transport: Transport.TCP,
        options: {
          host: 'auth-service',
          port: 4000,
        },
      },
    ]),
    ClsModule.forRoot({
      global: true, // <– makes ClsService available everywhere
      middleware: {
        mount: true, // <– wraps every HTTP request in a CLS context
        // optional setup if you want to pre-fill something from req:
        // setup: (cls, req) => {
        //   cls.set('requestId', req.headers['x-request-id']);
        // },
      },
    }),
    AppCacheModule,
    JwtModule.register({ global: true }),
    EventEmitterModule.forRoot({ global: true }),
    AuthModule,
    AccountModule,
  ],
})
export class AppModule {}
