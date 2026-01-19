import { Module } from '@nestjs/common';
import { GeneralSettingsController } from './generel-settings.controller';
import { AuthGuard } from '@/src/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuthGuard],
  controllers: [GeneralSettingsController],
})
export class GeneralSettingsModule {}
