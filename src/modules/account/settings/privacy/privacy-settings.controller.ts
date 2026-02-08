import {
  CACHE_KEYS,
  MICROSERVICE_NAMES,
} from '@/src/common/constants/constants';
import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
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

@Controller('account/settings/privacy-settings')
export class PrivacySettingsController {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP)
    private readonly service: ClientProxy,

    private readonly cls: ClsService,
    private readonly cacheService: AppCacheService,
  ) {}

  @Post('get')
  @UseGuards(AuthGuard)
  async get() {
    return await sendWithContext({
      client: this.service,
      endpoint: 'privacy-settings/get',
      cls: this.cls,
    });
  }

  // @Post('findOne')
  // @UseGuards(AuthGuard, SafeQueryGuard)
  // async findOne(@Body() data) {
  //   return await sendWithContext({
  //     client: this.service,
  //     endpoint: 'privacy-settings/findOne',
  //     payload: data,
  //     cls: this.cls,
  //   });
  // }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'privacy-settings/update',
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
          settings: { ...cachedUser.settings, privacySettings: res },
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
