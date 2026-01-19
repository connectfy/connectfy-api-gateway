import { Module } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { NotificationSettingsController } from './notification-settings.controller';

@Module({
  imports: [ConfigModule],
  providers: [AuthGuard],
  controllers: [NotificationSettingsController],
})
export class NotificationSettingsModule {}
