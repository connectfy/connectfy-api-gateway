import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { PrivacySettingsService } from './privacy-settings.service';

@UseGuards(AuthGuard)
@Controller('account/settings/privacy-settings')
export class PrivacySettingsController {
  constructor(
    private readonly privacySettingsService: PrivacySettingsService,
  ) {}

  @Post('get')
  async get() {
    return this.privacySettingsService.get();
  }

  @Patch('update')
  async update(@Body() data: any) {
    return this.privacySettingsService.update(data);
  }
}
