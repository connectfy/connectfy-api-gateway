import { Module } from '@nestjs/common';
import { PrivacySettingsController } from './privacy-settings.controller';
import { PrivacySettingsService } from './privacy-settings.service';

@Module({
  imports: [],
  providers: [PrivacySettingsService],
  controllers: [PrivacySettingsController],
})
export class PrivacySettingsModule {}
