import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { GeneralSettingsService } from './general-settings.service';

@UseGuards(AuthGuard)
@Controller('account/settings/general-settings')
export class GeneralSettingsController {
  constructor(
    private readonly generalSettingsService: GeneralSettingsService,
  ) {}

  @Post('get')
  async get() {
    return this.generalSettingsService.get();
  }

  @Patch('update')
  async update(@Body() data: any) {
    return this.generalSettingsService.update(data);
  }

  @Patch('reset')
  async reset() {
    return this.generalSettingsService.reset();
  }
}
