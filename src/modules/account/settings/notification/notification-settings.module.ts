import { Module } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { NotificationSettingsController } from './notification-settings.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE_TCP',
        transport: Transport.TCP,
        options: {
          host: 'auth-service',
          port: 4000,
        },
      },
      {
        name: 'ACCOUNT_SERVICE_TCP',
        transport: Transport.TCP,
        options: {
          host: 'account-service',
          port: 5000,
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [AuthGuard],
  controllers: [NotificationSettingsController],
})
export class NotificationSettingsModule {}
