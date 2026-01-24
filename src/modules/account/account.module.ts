import { Module } from '@nestjs/common';
import { GeneralSettingsModule } from './settings/general/generel-settings.module';
import { NotificationSettingsModule } from './settings/notification/notification-settings.module';
import { PrivacySettingsModule } from './settings/privacy/privacy-settings.module';

@Module({
  imports: [
    GeneralSettingsModule,
    NotificationSettingsModule,
    PrivacySettingsModule,
  ],
})
export class AccountModule {}
