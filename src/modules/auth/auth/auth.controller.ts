import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { AuthGuard } from '@guards/auth.guard';
import { ClsService } from 'nestjs-cls';
import {
  CACHE_KEYS,
  EXPIRE_DATES,
  BaseException,
  ExceptionMessages,
  CLS_KEYS,
} from 'connectfy-shared';
import { AppCacheService } from '@modules/cache/cache.service';
import { extractRequestData } from '@/src/common/functions/request';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: AppCacheService,
    private readonly cls: ClsService,
  ) {}

  private setRefreshCookie(token: string, res: Response): void {
    const isProd = ENVIRONMENT_VARIABLES.NODE_ENV === 'production';

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
    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/signup',
      payload: data,
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
    data.requestData = extractRequestData(request);

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/verify-signup',
      payload: data,
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

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/verify-signup/resend',
      payload,
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
    data.requestData = extractRequestData(request);

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/login',
      payload: data,
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
    data.requestData = extractRequestData(request);

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/google/login',
      payload: data,
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
    data.requestData = extractRequestData(request);

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/google/signup',
      payload: data,
    });

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    return response.status(201).json({ access_token: res.access_token });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/forgot-password',
      payload: data,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() data) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/reset-password',
      payload: data,
    });
  }

  @Post('refresh')
  async refreshToken(@Body() data, @Req() request, @Res() response: Response) {
    const finalData: Record<string, any> = {};

    finalData.deviceId = data.deviceId;
    finalData.refresh_token = request.cookies?.refresh_token;
    finalData.requestData = extractRequestData(request);

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/refreshToken',
      payload: finalData,
    });

    this.setRefreshCookie(res.refresh_token, response);

    return response.status(200).json({ access_token: res.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() data, @Res() response: Response) {
    const reqUser = await this.cls.get(CLS_KEYS.USER);

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/logout',
      payload: { ...data, userId: reqUser?._id },
    });

    if (res.statusCode === 200) {
      const userId = reqUser?._id;
      const cacheKey = CACHE_KEYS.USER(userId);
      if (userId) await this.cacheService.remove(cacheKey);

      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: ENVIRONMENT_VARIABLES.NODE_ENV === 'production',
        sameSite:
          ENVIRONMENT_VARIABLES.NODE_ENV === 'production' ? 'none' : 'lax',
      });
    }

    return response.status(200).json(res);
  }

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async deleteAccount(@Body() data, @Res() response: Response) {
    const user = await this.cls.get(CLS_KEYS.USER);
    const userId = user?._id;

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/delete-account',
      payload: { ...data, userId },
    });

    if (res.statusCode === 200) {
      const cacheKey = CACHE_KEYS.USER(userId);
      if (userId) await this.cacheService.remove(cacheKey);

      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: ENVIRONMENT_VARIABLES.NODE_ENV === 'production',
        sameSite:
          ENVIRONMENT_VARIABLES.NODE_ENV === 'production' ? 'none' : 'lax',
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
    return await this.tcpConnectionService.auth({
      endpoint: 'auth/is-valid-token',
      payload: data,
    });
  }

  @UseGuards(AuthGuard)
  @Post('authenticate-user')
  async authenticateUser(@Body() data) {
    return await this.tcpConnectionService.auth({
      endpoint: 'auth/authenticate-user',
      payload: data,
    });
  }

  @Post('restore-account')
  async restoreAccount(@Body() data, @Res() response: Response) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/restore-account',
      payload: data,
    });

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    return response.status(201).json({ access_token: res.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('deactivate-account')
  async deactivateAccount(@Body() data) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/deactivate-account',
      payload: data,
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
