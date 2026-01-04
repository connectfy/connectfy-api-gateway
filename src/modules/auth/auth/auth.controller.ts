import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';
import { AuthGuard } from '@guards/auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { ClsService } from 'nestjs-cls';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly service: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly config: ConfigService,
    private readonly cls: ClsService,
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
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/signup',
      payload: data,
      cls: this.cls,
    });

    session.unverifiedUser = res.unverifiedUser;
    session.verifyCode = res.verifyCode;

    return { statusCode: 200 };
  }

  @Post('signup/verify')
  async verifySignup(
    @Body() data,
    @Session() session: Record<string, any>,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    data.unverifiedUser = session.unverifiedUser;
    data.code = session.verifyCode;
    data.requestData = {
      headers: {
        'user-agent': request.headers['user-agent'],
        'x-forwarded-for': request.headers['x-forwarded-for'],
        'x-real-ip': request.headers['x-real-ip'],
        'cf-connecting-ip': request.headers['cf-connecting-ip'],
      },
      ip: request.socket.remoteAddress,
    };

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/verify-signup',
      payload: data,
      cls: this.cls,
    });

    if (res.refresh_token) {
      await this.setRefreshCookie(res.refresh_token, response);

      delete session.unverifiedUser;
      delete session.verifyCode;
    }

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('login')
  async login(
    @Body() data,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    data.requestData = {
      headers: {
        'user-agent': request.headers['user-agent'],
        'x-forwarded-for': request.headers['x-forwarded-for'],
        'x-real-ip': request.headers['x-real-ip'],
        'cf-connecting-ip': request.headers['cf-connecting-ip'],
      },
      ip: request.socket.remoteAddress,
    };

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/login',
      payload: data,
      cls: this.cls,
    });

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('google/login')
  async googleAuthLogin(
    @Body() data,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    data.requestData = {
      headers: {
        'user-agent': request.headers['user-agent'],
        'x-forwarded-for': request.headers['x-forwarded-for'],
        'x-real-ip': request.headers['x-real-ip'],
        'cf-connecting-ip': request.headers['cf-connecting-ip'],
      },
      ip: request.socket.remoteAddress,
    };

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/google/login',
      payload: data,
      cls: this.cls,
    });

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('google/signup')
  async googleAuthSignup(
    @Body() data,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    data.requestData = {
      headers: {
        'user-agent': request.headers['user-agent'],
        'x-forwarded-for': request.headers['x-forwarded-for'],
        'x-real-ip': request.headers['x-real-ip'],
        'cf-connecting-ip': request.headers['cf-connecting-ip'],
      },
      ip: request.socket.remoteAddress,
    };

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/google/signup',
      payload: data,
      cls: this.cls,
    });

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data) {
    const res = sendWithContext({
      client: this.service,
      endpoint: 'auth/forgot-password',
      payload: data,
      cls: this.cls,
    });
    return res;
  }

  @Post('reset-password')
  async resetPassword(@Body() data) {
    const res = sendWithContext({
      client: this.service,
      endpoint: 'auth/reset-password',
      payload: data,
      cls: this.cls,
    });
    return res;
  }

  @Post('refresh')
  async refreshToken(@Req() request, @Res() response: Response) {
    let data: Record<string, any> = {};

    data.refresh_token = request.cookies?.refresh_token;
    data.requestData = {
      headers: {
        'user-agent': request.headers['user-agent'],
        'x-forwarded-for': request.headers['x-forwarded-for'],
        'x-real-ip': request.headers['x-real-ip'],
        'cf-connecting-ip': request.headers['cf-connecting-ip'],
      },
      ip: request.socket.remoteAddress,
    };

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/refreshToken',
      payload: data,
      cls: this.cls,
    });

    await this.setRefreshCookie(res.refresh_token, response);

    return response.status(200).json({ access_token: res.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() data, @Res() response: Response) {
    const reqUser = await this.cls.get('user');

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/logout',
      payload: { ...data, userId: reqUser?.user?._id },
      cls: this.cls,
    });

    if (res.statusCode === 200) {
      const userId = reqUser?.user?._id;
      if (userId) await this.cacheService.del(`user:${userId}`);

      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: this.config.get<string>('NODE_ENV') === 'production',
        sameSite:
          this.config.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',
      });
    }

    return response.status(200).json(res);
  }

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async deleteAccount(@Body() data, @Res() response: Response) {
    const user = await this.cls.get('user');
    const userId = user?.user?._id;

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/delete-account',
      payload: { ...data, userId },
      cls: this.cls,
    });

    if (res.statusCode === 200) {
      if (userId) await this.cacheService.del(`user:${userId}`);

      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: this.config.get<string>('NODE_ENV') === 'production',
        sameSite:
          this.config.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',
      });
    }

    return response.status(200).json(res);
  }

  // @UseGuards(AuthGuard)
  // @Post('remove-account')
  // async removeAccount(@Body() data) {
  //   const res = await sendWithContext({
  //     client: this.service,
  //     endpoint: 'auth/remove-account',
  //     payload: data,
  //     cls: this.cls
  //   });

  //   if (res.statusCode === 200) await this.cacheService.clear(); /// BU daha sonra dəyişdirilməlidir

  //   return res;
  // }

  @UseGuards(AuthGuard)
  @Post('face-descriptor')
  async faceDescriptor(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/faceDescriptor',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @Post('is-valid-token')
  async isValidToken(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/is-valid-token',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @UseGuards(AuthGuard)
  @Post('authenticate-user')
  async authenticateUser(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/authenticate-user',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @Post('restore-account')
  async restoreAccount(@Body() data, @Res() response: Response) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/restore-account',
      payload: data,
      cls: this.cls,
    });

    if (res.refresh_token)
      await this.setRefreshCookie(res.refresh_token, response);

    return response.status(201).json({ access_token: res.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('deactivate-account')
  async deactivateAccount(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/deactivate-account',
      payload: data,
      cls: this.cls,
    });

    if (res.statusCode === 200) {
      const user = await this.cls.get('user');
      const userId = user?.user?._id;

      await this.cacheService.del(`user:${userId}`);
    }

    return res;
  }
}
