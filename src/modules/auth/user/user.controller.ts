import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@guards/auth.guard';
import { UserService } from './user.service';

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
}
