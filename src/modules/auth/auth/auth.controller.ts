import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';
import { AuthGuard } from '@guards/auth.guard';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import {
  CACHE_KEYS,
  ENV,
  EXPIRE_DATES,
  MICROSERVICE_NAMES,
  sendWithContext,
  BaseException,
  ExceptionMessages,
  CLS_KEYS,
} from 'connectfy-shared';
import { AppCacheService } from '@modules/cache/cache.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE_NAMES.AUTH.TCP) private readonly service: ClientProxy,

    private readonly cacheService: AppCacheService,
    private readonly config: ConfigService,
    private readonly cls: ClsService,
  ) {}

  private setRefreshCookie(token: string, res: Response): void {
    const isProd =
      this.config.get<string>(ENV.CORE.APP.NODE_ENV) === 'production';

    const cookieOptions: CookieOptions = {
      maxAge: EXPIRE_DATES.TOKEN.ONE_MONTH,
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
      this.setRefreshCookie(res.refresh_token, response);

      delete session.unverifiedUser;
      delete session.verifyCode;
    }

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('signup/verify/resend')
  async resendSignupVerify(
    @Body() data,
    @Session() session: Record<string, any>,
  ) {
    const payload = session.unverifiedUser;

    if (!payload)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE,
        HttpStatus.NOT_FOUND,
        { navigate: true },
      );

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/verify-signup/resend',
      payload,
      cls: this.cls,
    });

    session.verifyCode = res.verifyCode;

    return { statusCode: 200 };
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

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    const { refresh_token, ...rest } = res;

    return response.status(201).json(rest);
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

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    const { refresh_token, ...rest } = res;

    return response.status(201).json(rest);
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

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data) {
    return sendWithContext({
      client: this.service,
      endpoint: 'auth/forgot-password',
      payload: data,
      cls: this.cls,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() data) {
    return sendWithContext({
      client: this.service,
      endpoint: 'auth/reset-password',
      payload: data,
      cls: this.cls,
    });
  }

  @Post('refresh')
  async refreshToken(@Body() data, @Req() request, @Res() response: Response) {
    const finalData: Record<string, any> = {};

    finalData.deviceId = data.deviceId;
    finalData.refresh_token = request.cookies?.refresh_token;
    finalData.requestData = {
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
      payload: finalData,
      cls: this.cls,
    });

    this.setRefreshCookie(res.refresh_token, response);

    return response.status(200).json({ access_token: res.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() data, @Res() response: Response) {
    const reqUser = await this.cls.get(CLS_KEYS.USER);

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/logout',
      payload: { ...data, userId: reqUser?._id },
      cls: this.cls,
    });

    if (res.statusCode === 200) {
      const userId = reqUser?._id;
      const cacheKey = CACHE_KEYS.USER(userId);
      if (userId) await this.cacheService.remove(cacheKey);

      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: this.config.get<string>(ENV.CORE.APP.NODE_ENV) === 'production',
        sameSite:
          this.config.get<string>(ENV.CORE.APP.NODE_ENV) === 'production'
            ? 'none'
            : 'lax',
      });
    }

    return response.status(200).json(res);
  }

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async deleteAccount(@Body() data, @Res() response: Response) {
    const user = await this.cls.get(CLS_KEYS.USER);
    const userId = user?._id;

    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/delete-account',
      payload: { ...data, userId },
      cls: this.cls,
    });

    if (res.statusCode === 200) {
      const cacheKey = CACHE_KEYS.USER(userId);
      if (userId) await this.cacheService.remove(cacheKey);

      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: this.config.get<string>(ENV.CORE.APP.NODE_ENV) === 'production',
        sameSite:
          this.config.get<string>(ENV.CORE.APP.NODE_ENV) === 'production'
            ? 'none'
            : 'lax',
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

  @Post('is-valid-token')
  async isValidToken(@Body() data) {
    return await sendWithContext({
      client: this.service,
      endpoint: 'auth/is-valid-token',
      payload: data,
      cls: this.cls,
    });
  }

  @UseGuards(AuthGuard)
  @Post('authenticate-user')
  async authenticateUser(@Body() data) {
    return await sendWithContext({
      client: this.service,
      endpoint: 'auth/authenticate-user',
      payload: data,
      cls: this.cls,
    });
  }

  @Post('restore-account')
  async restoreAccount(@Body() data, @Res() response: Response) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'auth/restore-account',
      payload: data,
      cls: this.cls,
    });

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

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
      const user = await this.cls.get(CLS_KEYS.USER);
      const userId = user?._id;

      const cacheKey = CACHE_KEYS.USER(userId);
      await this.cacheService.remove(cacheKey);
    }

    return res;
  }
}
