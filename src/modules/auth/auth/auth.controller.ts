import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Request, Response, CookieOptions, response } from 'express';
import { AuthGuard } from '@guards/auth.guard';
import {
  BaseException,
  CLS_KEYS,
  ExceptionMessages,
  EXPIRE_DATES,
  HttpStatus,
  LANGUAGE,
} from 'connectfy-shared';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { extractRequestData } from '@/src/common/functions/request';
import { AuthService } from './auth.service';
import { ClsService } from 'nestjs-cls';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly cls: ClsService,
  ) {}

  private setRefreshCookie(token: string, res: Response) {
    const isProd = ENVIRONMENT_VARIABLES.NODE_ENV === 'production';

    const cookieOptions: CookieOptions = {
      maxAge: EXPIRE_DATES.TOKEN.ONE_MONTH,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };

    res.cookie('refresh_token', token, cookieOptions);
  }

  private saveSession(session: any): Promise<void> {
    return new Promise((resolve, reject) => {
      session.save((err) => (err ? reject(err) : resolve()));
    });
  }

  @Post('signup')
  async signup(@Body() data, @Session() session: Record<string, any>) {
    const res = await this.service.signup(data);

    session.unverifiedUser = res.unverifiedUser;
    session.verifyCode = res.verifyCode;
    session.cookie.maxAge = 1000 * 60 * 15;

    await this.saveSession(session);

    return { statusCode: 200 };
  }

  @Post('signup/verify')
  async verifySignup(
    @Body() data,
    @Session() session,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    const unverifiedUser = session.unverifiedUser;
    const code = session.verifyCode;

    if (!unverifiedUser || !code) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
        { navigate: true },
      );
    }

    data.deviceId = deviceId;
    data.code = session.verifyCode;
    data.unverifiedUser = session.unverifiedUser;
    data.requestData = extractRequestData(req);

    const result = await this.service.verifySignup(data);

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);

      delete session.unverifiedUser;
      delete session.verifyCode;
    }

    return { access_token: result.access_token };
  }

  @Post('signup/verify/resend')
  async resendSignupVerify(@Session() session: Record<string, any>) {
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const payload = session.unverifiedUser;

    if (!payload) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
        { navigate: true },
      );
    }

    const res = await this.service.resendSignupVerify(payload);

    session.verifyCode = res.verifyCode;
    session.cookie.maxAge = 1000 * 60 * 15;

    await this.saveSession(session);

    return { statusCode: 200 };
  }

  @Post('login')
  async login(
    @Body() data,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Session() session: Record<string, any>,
  ) {
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    data.requestData = extractRequestData(req);
    data.deviceId = deviceId;

    const result = await this.service.login(data);

    let responseData;

    if (result.isTwoFactorEnabled) {
      const { code, userId, ...rest } = result;
      session.twoFaCode = code;
      session.userId = userId;
      session.cookie.maxAge = 1000 * 60 * 15;

      await this.saveSession(session);

      responseData = rest;
    }

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);

      const { refresh_token, ...rest } = result;
      responseData = rest;
    }

    return responseData;
  }

  @Post('login/verify')
  async verifyLogin(
    @Body() data,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Session() session: Record<string, any>,
  ) {
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    const userId = session.userId;
    const twoFaCode = session.twoFaCode;

    if (!userId || !twoFaCode) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
        { navigate: true },
      );
    }

    data.requestData = extractRequestData(req);
    data.userId = userId;
    data.twoFaCode = twoFaCode;
    data.deviceId = deviceId;

    const result = await this.service.verifyLogin(data);

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);

      delete session.twoFaCode;
      delete session.userId;
    }

    const { refresh_token, ...rest } = result;

    return rest;
  }

  @Post('google/login')
  async googleAuthLogin(
    @Body() data,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    data.requestData = extractRequestData(request);
    data.deviceId = deviceId;

    const res = await this.service.googleLogin(data);

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    const { refresh_token, ...rest } = res;

    return rest;
  }

  @Post('google/signup')
  async googleAuthSignup(
    @Body() data,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    data.requestData = extractRequestData(request);
    data.deviceId = deviceId;

    const res = await this.service.googleSignup(data);

    if (res.refresh_token) {
      this.setRefreshCookie(res.refresh_token, response);
    }

    return { access_token: res.access_token };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);

    const payload = {
      deviceId,
      refresh_token: req.cookies?.refresh_token,
      requestData: extractRequestData(req),
    };

    const result = await this.service.refreshToken(payload);

    this.setRefreshCookie(result.refresh_token, res);

    return { access_token: result.access_token };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Session() session: Record<string, any>,
  ) {
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    const authHeader = req.headers.authorization;

    const [type, token] = (authHeader ?? '').split(' ');
    const accessToken = type === 'Bearer' ? token : '';

    const result = await this.service.logout({ deviceId }, accessToken);

    res.clearCookie('refresh_token');
    session.destroy();

    return result;
  }

  @Post('restore-account')
  async restoreAccount(
    @Body() data,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceId = this.cls.get<string>(CLS_KEYS.DEVICE_ID);
    data.requestData = extractRequestData(req);
    data.deviceId = deviceId;
    const result = await this.service.restoreAccount(data);

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);
    }

    const { refresh_token, ...rest } = result;

    return rest;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data) {
    return this.service.forgotPassword(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data) {
    return this.service.resetPassword(data);
  }

  @UseGuards(AuthGuard)
  @Post('authenticate-user')
  async authenticateUser(@Body() data) {
    return this.service.authenticateUser(data);
  }

  @Post('is-valid-token')
  async isValidToken(@Body() data) {
    return this.service.isValidToken(data);
  }
}
