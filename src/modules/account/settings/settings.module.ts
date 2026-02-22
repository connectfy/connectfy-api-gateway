import { Module } from '@nestjs/common';
import { GeneralSettingsModule } from './general/generel-settings.module';
import { NotificationSettingsModule } from './notification/notification-settings.module';
import { PrivacySettingsModule } from './privacy/privacy-settings.module';

@Module({
  imports: [
    GeneralSettingsModule,
    NotificationSettingsModule,
    PrivacySettingsModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class SettingsModule {}
