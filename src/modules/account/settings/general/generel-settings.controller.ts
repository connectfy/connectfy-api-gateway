import { EXPIRE_DATES, MICROSERVICE_NAMES } from '@/src/common/constants/constants';
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

@Controller('account/settings/general-settings')
export class GeneralSettingsController {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP) private readonly service: ClientProxy,

    private readonly cls: ClsService,
    private readonly cacheService: Cache,
  ) {}

  @Post('findOne')
  @UseGuards(AuthGuard, SafeQueryGuard)
  async findOne(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'general-settings/findOne',
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
      endpoint: 'general-settings/update',
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
          settings: { ...cachedUser.settings, generalSettings: res },
        };

        await this.cacheService.set(cacheKey, updatedUser, EXPIRE_DATES.TOKEN.ONE_HOUR); // 1 hour
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
      const cacheKey = `user:${res.generalSettings.userId}`;
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.del(cacheKey);
        const updatedUser = {
          ...cachedUser,
          settings: res,
        };

        await this.cacheService.set(cacheKey, updatedUser, EXPIRE_DATES.TOKEN.ONE_HOUR); // 1 hour
      }
    }

    return res;
  }
}
