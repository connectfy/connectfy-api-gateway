import { Module } from '@nestjs/common';
import { GeneralSettingsModule } from './settings/general/generel-settings.module';
import { NotificationSettingsModule } from './settings/notification/notification-settings.module';
import { PrivacySettingsModule } from './settings/privacy/privacy-settings.module';
import { AccountModule as AccountServiceModule } from './account/account.module';

@Module({
  imports: [
    AccountServiceModule,
    GeneralSettingsModule,
    NotificationSettingsModule,
    PrivacySettingsModule,
  ],
})
export class AccountModule {}
