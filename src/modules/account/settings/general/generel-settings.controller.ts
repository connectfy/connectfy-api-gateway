import { CACHE_KEYS } from 'connectfy-shared';
import { AuthGuard } from '@/src/guards/auth.guard';
import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AppCacheService } from '@modules/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';

@UseGuards(AuthGuard)
@Controller('account/settings/general-settings')
export class GeneralSettingsController {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: AppCacheService,
  ) {}

  @Post('get')
  async get() {
    return await this.tcpConnectionService.account({
      endpoint: 'general-settings/get',
    });
  }

  // @Post('findOne')
  // @UseGuards(AuthGuard, SafeQueryGuard)
  // async findOne(@Body() data) {
  //   return await sendWithContext({
  //     client: this.service,
  //     endpoint: 'general-settings/findOne',
  //     payload: data,
  //     cls: this.cls,
  //   });
  // }

  @Patch('update')
  async update(@Body() data) {
    const res = await this.tcpConnectionService.account({
      endpoint: 'general-settings/update',
      payload: data,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res.userId);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);
        const updatedUser = {
          ...cachedUser,
          settings: { ...cachedUser.settings, generalSettings: res },
        };

        await this.cacheService.set({
          key: cacheKey,
          data: updatedUser,
        });
      }
    }

    return res;
  }

  @Patch('reset')
  async reset() {
    const res = await this.tcpConnectionService.account({
      endpoint: 'general-settings/reset',
    });

    if (res.generalSettings) {
      const cacheKey = CACHE_KEYS.USER(res.generalSettings.userId);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);
        const updatedUser = {
          ...cachedUser,
          settings: res,
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
