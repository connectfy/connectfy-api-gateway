import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/src/guards/auth.guard';
import { NotificationSettingsService } from './notification-settings.service';

@UseGuards(AuthGuard)
@Controller('account/settings/notification-settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Post('get')
  async get() {
    return this.notificationSettingsService.get();
  }

  @Patch('update')
  async update(@Body() data: any) {
    return this.notificationSettingsService.update(data);
  }
}
