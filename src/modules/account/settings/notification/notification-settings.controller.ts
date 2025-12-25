import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@/src/guards/auth.guard';
import { SafeQueryGuard } from '@/src/guards/safeQuery.guard';
import { Cache } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

@Controller('account/settings/notification-settings')
export class NotificationSettingsController {
  constructor(
    @Inject('ACCOUNT_SERVICE_TCP') private readonly service: ClientProxy,

    private readonly cls: ClsService,
    private readonly cacheService: Cache,
  ) {}

  @Post('findOne')
  @UseGuards(AuthGuard, SafeQueryGuard)
  async findOne(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'notification-settings/findOne',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'notification-settings/update',
      payload: data,
      cls: this.cls,
    });

    if (res._id) {
      const cacheKey = `user:${res.userId}`;
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.del(cacheKey);
        const updatedUser = {
          ...cachedUser,
          settings: { ...cachedUser.settings, notificationSettings: res },
        };

        await this.cacheService.set(cacheKey, updatedUser, 60 * 60 * 1000); // 1 hour
      }
    }

    return res;
  }
}
