import { Module } from '@nestjs/common';
import { GeneralSettingsModule } from './settings/general/generel-settings.module';
import { NotificationSettingsModule } from './settings/notification/notification-settings.module';
import { PrivacySettingsModule } from './settings/privacy/privacy-settings.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from '@common/constants/constants';

@Module({
  imports: [
    GeneralSettingsModule,
    NotificationSettingsModule,
    PrivacySettingsModule,
    ClientsModule.register({
      clients: [
        {
          name: MICROSERVICE_NAMES.ACCOUNT.TCP,
          transport: Transport.TCP,
          options: {
            host: 'account-service',
            port: 5000,
          },
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class AccountModule {}
