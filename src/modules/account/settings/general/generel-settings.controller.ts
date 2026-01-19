import {
  CACHE_KEYS,
  MICROSERVICE_NAMES,
} from '@/src/common/constants/constants';
import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@/src/guards/auth.guard';
import { SafeQueryGuard } from '@/src/guards/safeQuery.guard';
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

@Controller('account/settings/general-settings')
export class GeneralSettingsController {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP)
    private readonly service: ClientProxy,

    private readonly cls: ClsService,
    private readonly cacheService: AppCacheService,
  ) {}

  @Post('findOne')
  @UseGuards(AuthGuard, SafeQueryGuard)
  async findOne(@Body() data) {
    return await sendWithContext({
      client: this.service,
      endpoint: 'general-settings/findOne',
      payload: data,
      cls: this.cls,
    });
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'general-settings/update',
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
  @UseGuards(AuthGuard)
  async reset() {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'general-settings/reset',
      cls: this.cls,
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
