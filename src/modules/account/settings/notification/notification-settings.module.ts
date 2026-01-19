import { Module } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { NotificationSettingsController } from './notification-settings.controller';
import { MICROSERVICE_NAMES } from '@/src/common/constants/constants';
import { AppCacheModule } from '@modules/cache/cache.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_NAMES.AUTH.TCP,
        transport: Transport.TCP,
        options: {
          host: 'auth-service',
          port: 4000,
        },
      },
      {
        name: MICROSERVICE_NAMES.ACCOUNT.TCP,
        transport: Transport.TCP,
        options: {
          host: 'account-service',
          port: 5000,
        },
      },
    ]),
    ConfigModule,
    AppCacheModule,
  ],
  providers: [AuthGuard],
  controllers: [NotificationSettingsController],
})
export class NotificationSettingsModule {}
