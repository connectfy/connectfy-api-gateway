import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from '@modules/auth/auth.module';
import { AccountModule } from '@modules/account/account.module';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';
import { AppCacheModule } from '@modules/cache/cache.module';
import { TcpConnectionsModule } from '@/src/services/app-connections/tcp-connections.module';
import { KafkaConnectionsModule } from '@/src/services/app-connections/kafka-connections.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
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
    TcpConnectionsModule,
    KafkaConnectionsModule,
  ],
})
export class AppModule {}
