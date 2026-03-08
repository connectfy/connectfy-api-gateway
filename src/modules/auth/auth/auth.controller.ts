import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Request, Response, CookieOptions } from 'express';
import { AuthGuard } from '@guards/auth.guard';
import { EXPIRE_DATES } from 'connectfy-shared';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { extractRequestData } from '@/src/common/functions/request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

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

  @Post('signup')
  async signup(@Body() data, @Session() session: Record<string, any>) {
    const res = await this.service.signup(data);

    session.unverifiedUser = res.unverifiedUser;
    session.verifyCode = res.verifyCode;

    return { statusCode: 200 };
  }

  @Post('signup/verify')
  async verifySignup(
    @Body() data,
    @Session() session,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    data.unverifiedUser = session.unverifiedUser;
    data.code = session.verifyCode;
    data.requestData = extractRequestData(req);

    const result = await this.service.verifySignup(data);

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);

      delete session.unverifiedUser;
      delete session.verifyCode;
    }

    return res.status(201).json({ access_token: result.access_token });
  }

  @Post('login')
  async login(@Body() data, @Req() req: Request, @Res() res: Response) {
    data.requestData = extractRequestData(req);

    const result = await this.service.login(data);

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);
    }

    const { refresh_token, ...rest } = result;

    return res.status(201).json(rest);
  }

  @Post('refresh')
  async refresh(@Body() data, @Req() req: Request, @Res() res: Response) {
    const payload = {
      deviceId: data.deviceId,
      refresh_token: req.cookies?.refresh_token,
      requestData: extractRequestData(req),
    };

    const result = await this.service.refreshToken(payload);

    this.setRefreshCookie(result.refresh_token, res);

    return res.status(200).json({ access_token: result.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() data, @Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers.authorization;

    let accessToken;
    if (!authHeader) {
      accessToken = '';
    } else {
      const [type, token] = authHeader.split(' ');
      accessToken = type === 'Bearer' ? token : '';
    }

    const result = await this.service.logout(data, accessToken);

    res.clearCookie('refresh_token');

    return res.status(200).json(result);
  }

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async deleteAccount(@Body() data, @Res() res: Response) {
    const result = await this.service.deleteAccount(data);

    res.clearCookie('refresh_token');

    return res.status(200).json(result);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data) {
    return this.service.forgotPassword(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data) {
    return this.service.resetPassword(data);
  }

  @Post('restore-account')
  async restoreAccount(@Body() data, @Res() res: Response) {
    const result = await this.service.restoreAccount(data);

    if (result.refresh_token) {
      this.setRefreshCookie(result.refresh_token, res);
    }

    return res.status(201).json({ access_token: result.access_token });
  }

  @UseGuards(AuthGuard)
  @Post('deactivate-account')
  async deactivateAccount(@Body() data) {
    return this.service.deactivateAccount(data);
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
