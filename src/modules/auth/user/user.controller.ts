import { CACHE_KEYS, CLS_KEYS } from 'connectfy-shared';
import { AuthGuard } from '@guards/auth.guard';
import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AppCacheService } from '@modules/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
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

    return await this.tcpConnectionService.auth({
      endpoint: 'user/me',
      payload: data,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('change-username')
  async changeUsername(@Body() data) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-username',
      payload: data,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res._id);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);

        const updatedUser = {
          ...cachedUser,
          username: res.username,
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
    return await this.tcpConnectionService.auth({
      endpoint: 'user/change-email',
      payload: data,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('change-email/verify')
  async verifyEmailChange(@Body() data) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-email/verify',
      payload: data,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res._id);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);

        const updatedUser = {
          ...cachedUser,
          email: res.email,
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
    return await this.tcpConnectionService.auth({
      endpoint: 'user/change-password',
      payload: data,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('change-phone-number')
  async changePhoneNumber(@Body() data) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-phone-number',
      payload: data,
    });

    if (res._id) {
      const cacheKey = CACHE_KEYS.USER(res._id);
      const cachedUser: Record<string, any> | undefined =
        await this.cacheService.get(cacheKey);

      if (cachedUser) {
        await this.cacheService.remove(cacheKey);

        const updatedUser = {
          ...cachedUser,
          phoneNumber: res.phoneNumber,
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
    return await this.tcpConnectionService.auth({
      endpoint: 'user/check-unique',
      payload: data,
    });
  }
}
