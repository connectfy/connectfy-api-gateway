import { Module } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { PrivacySettingsController } from './privacy-settings.controller';

@Module({
  imports: [ConfigModule],
  providers: [AuthGuard],
  controllers: [PrivacySettingsController],
})
export class PrivacySettingsModule {}
