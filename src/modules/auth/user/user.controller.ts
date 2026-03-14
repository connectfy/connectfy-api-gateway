import {
  Body,
  Controller,
  Patch,
  Post,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@guards/auth.guard';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me() {
    return this.service.getMe();
  }

  @UseGuards(AuthGuard)
  @Patch('change-username')
  async changeUsername(@Body() data: any) {
    return this.service.changeUsername(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-email')
  async changeEmail(@Body() data: any) {
    return this.service.changeEmail(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-email/verify')
  async verifyEmailChange(@Body() data: any) {
    return this.service.verifyEmailChange(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(@Body() data: any) {
    return this.service.changePassword(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-phone-number')
  async changePhoneNumber(@Body() data: any) {
    return this.service.changePhoneNumber(data);
  }

  @Post('check-unique')
  async checkUnique(@Body() data: any) {
    return this.service.checkUnique(data);
  }

  @UseGuards(AuthGuard)
  @Patch('two-factor')
  async updateTwoFactorAuth(@Body() data: any) {
    return this.service.updateTwoFactorAuth(data);
  }

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async deleteAccount(
    @Body() data,
    @Res({ passthrough: true }) res: Response,
    @Session() session: Record<string, any>,
  ) {
    const result = await this.service.deleteAccount(data);

    res.clearCookie('refresh_token');
    session.destroy();

    return result;
  }

  @UseGuards(AuthGuard)
  @Post('deactivate-account')
  async deactivateAccount(
    @Body() data,
    @Session() session: Record<string, any>,
  ) {
    const result = await this.service.deactivateAccount(data);

    session.destroy();

    return result;
  }
}
