import { Module } from '@nestjs/common';
import { GeneralSettingsModule } from './settings/general/generel-settings.module';
import { NotificationSettingsModule } from './settings/notification/notification-settings.module';
import { PrivacySettingsModule } from './settings/privacy/privacy-settings.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ProfileModule,
    GeneralSettingsModule,
    NotificationSettingsModule,
    PrivacySettingsModule,
  ],
})
export class AccountModule {}
