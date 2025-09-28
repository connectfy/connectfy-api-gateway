import {
  Body,
  Controller,
  Inject,
  Post,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { AuthGuard } from '@/src/guards/auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly service: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly config: ConfigService,
  ) {}

  private async setRefreshCookie(token: string, res: Response): Promise<void> {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    const cookieOptions: CookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };

    res.cookie('refresh_token', token, cookieOptions);
  }

  @Post('signup')
  async signup(@Body() data, @Session() session: Record<string, any>) {
    const res = await lastValueFrom(this.service.send('auth/signup', data));

    session.unverifiedUser = res.unverifiedUser;
    session.verifyCode = res.verifyCode;

    return { statusCode: 200 };
  }

  @Post('signup/verify')
  async verifySignup(
    @Body() data,
    @Session() session: Record<string, any>,
    @Res() response: Response,
  ) {
    data.unverifiedUser = session.unverifiedUser;
    data.verifyCode = session.verifyCode;

    const res = await lastValueFrom(
      this.service.send('auth/verify-signup', data),
    );

    if (res.refresh_token) {
      await this.setRefreshCookie(res.refresh_token, response);

      delete session.unverifiedUser;
      delete session.verifyCode;
    }

    return response.status(201).json(res);
  }

  @Post('login')
  async login(@Body() data, @Res() response: Response) {
    const res = await lastValueFrom(this.service.send('auth/login', data));

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json(res);
  }

  @Post('google/login')
  async googleAuthLogin(@Body() data, @Res() response: Response) {
    const res = await lastValueFrom(
      this.service.send('auth/google/login', data),
    );

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json(res);
  }

  @Post('google/signup')
  async googleAuthSignup(@Body() data, @Res() response: Response) {
    const res = await lastValueFrom(
      this.service.send('auth/google/signup', data),
    );

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json(res);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data) {
    const res = lastValueFrom(this.service.send('auth/forgot-password', data));
    return res;
  }

  @Post('reset-password')
  async resetPassword(@Body() data) {
    const res = lastValueFrom(this.service.send('auth/reset-password', data));
    return res;
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() data) {
    const res = await lastValueFrom(this.service.send('auth/logout', data));

    if (res.statusCode === 200) {
      await this.cacheService.clear();
    }

    return res;
  }

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async deleteAccount(@Body() data) {
    return await lastValueFrom(this.service.send('auth/delete-account', data));
  }

  @UseGuards(AuthGuard)
  @Post('remove-account')
  async removeAccount(@Body() data, @Session() session: Record<string, any>) {
    const res = await lastValueFrom(
      this.service.send('auth/remove-account', data),
    );

    if (res.statusCode === 200) this.cacheService.clear();

    return res;
  }
}
