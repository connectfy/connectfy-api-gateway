import {
  CACHE_KEYS,
  MICROSERVICE_NAMES,
  sendWithContext,
} from 'connectfy-shared';
import { AuthGuard } from '@/src/guards/auth.guard';
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
import { AppCacheService } from '@modules/cache/cache.service';

@UseGuards(AuthGuard)
@Controller('account/settings/notification-settings')
export class NotificationSettingsController {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP)
    private readonly service: ClientProxy,

    private readonly cls: ClsService,
    private readonly cacheService: AppCacheService,
  ) {}

  @Post('get')
  async get() {
    return await sendWithContext({
      client: this.service,
      endpoint: 'notification-settings/get',
      cls: this.cls,
    });
  }

  // @Post('findOne')
  // @UseGuards(AuthGuard, SafeQueryGuard)
  // async findOne(@Body() data) {
  //   return await sendWithContext({
  //     client: this.service,
  //     endpoint: 'notification-settings/findOne',
  //     payload: data,
  //     cls: this.cls,
  //   });
  // }

  @Patch('update')
  async update(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'notification-settings/update',
      payload: data,
      cls: this.cls,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res.userId);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);
        const updatedUser = {
          ...cachedUser,
          settings: { ...cachedUser.settings, notificationSettings: res },
        };

        await this.cacheService.set({
          key: cacheKey,
          data: updatedUser,
        });
      }
    }

    return res;
  }
}
