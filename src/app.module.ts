import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { ModulesModule } from './modules/modules.module';

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
    JwtModule.register({ global: true }),
    EventEmitterModule.forRoot({ global: true }),

    // /src/app-settings
    AppSettingsModule,
    // /src/modules
    ModulesModule,
  ],
})
export class AppModule {}
