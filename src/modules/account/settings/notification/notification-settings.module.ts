import { Module } from '@nestjs/common';
import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettingsService } from './notification-settings.service';

@Module({
  imports: [],
  providers: [NotificationSettingsService],
  controllers: [NotificationSettingsController],
})
export class NotificationSettingsModule {}
