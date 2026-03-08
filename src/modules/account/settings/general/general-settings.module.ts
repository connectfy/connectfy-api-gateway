import { Module } from '@nestjs/common';
import { GeneralSettingsController } from './general-settings.controller';
import { GeneralSettingsService } from './general-settings.service';

@Module({
  imports: [],
  providers: [GeneralSettingsService],
  controllers: [GeneralSettingsController],
})
export class GeneralSettingsModule {}
