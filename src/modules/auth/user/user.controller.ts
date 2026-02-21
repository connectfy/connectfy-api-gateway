import {
  CACHE_KEYS,
  MICROSERVICE_NAMES,
} from '@/src/common/constants/constants';
import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@guards/auth.guard';
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
import { CLS_KEYS } from '@common/enums/enums';
import { AppCacheService } from '@modules/cache/cache.service';

@Controller('user')
export class UserController {
  constructor(
    @Inject(MICROSERVICE_NAMES.AUTH.TCP) private readonly service: ClientProxy,

    private readonly cacheService: AppCacheService,
    private readonly cls: ClsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Body() data) {
    const reqUser = await this.cls.get(CLS_KEYS.USER);

    if (reqUser) {
      const cacheKey = CACHE_KEYS.USER(reqUser._id);
      const cachedUser = await this.cacheService.get(cacheKey);

      if (cachedUser) {
        return cachedUser;
      }
    }

    return await sendWithContext({
      client: this.service,
      endpoint: 'user/me',
      payload: data,
      cls: this.cls,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('change-username')
  async changeUsername(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-username',
      payload: data,
      cls: this.cls,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res._id);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);

        const updatedUser = {
          ...cachedUser,
          user: { ...cachedUser.user, username: res.username },
        };
        await this.cacheService.set({
          key: cacheKey,
          data: updatedUser,
        });
      }
    }

    return res;
  }

  @UseGuards(AuthGuard)
  @Patch('change-email')
  async changeEmail(@Body() data) {
    return await sendWithContext({
      client: this.service,
      endpoint: 'user/change-email',
      payload: data,
      cls: this.cls,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('change-email/verify')
  async verifyEmailChange(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-email/verify',
      payload: data,
      cls: this.cls,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res._id);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);

        const updatedUser = {
          ...cachedUser,
          user: { ...cachedUser.user, email: res.email },
        };
        await this.cacheService.set({
          key: cacheKey,
          data: updatedUser,
        });
      }
    }

    return res;
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(@Body() data) {
    return await sendWithContext({
      client: this.service,
      endpoint: 'user/change-password',
      payload: data,
      cls: this.cls,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('change-phone-number')
  async changePhoneNumber(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-phone-number',
      payload: data,
      cls: this.cls,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res._id);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);

        const updatedUser = {
          ...cachedUser,
          user: { ...cachedUser.user, phoneNumber: res.phoneNumber },
        };
        await this.cacheService.set({
          key: cacheKey,
          data: updatedUser,
        });
      }
    }

    return res;
  }

  @Post('check-unique')
  async checkUnique(@Body() data) {
    return await sendWithContext({
      client: this.service,
      endpoint: 'user/check-unique',
      payload: data,
      cls: this.cls,
    });
  }
}
