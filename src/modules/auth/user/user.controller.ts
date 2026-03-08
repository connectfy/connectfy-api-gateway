import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@guards/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me() {
    return await this.service.getMe();
  }

  @UseGuards(AuthGuard)
  @Patch('change-username')
  async changeUsername(@Body() data: any) {
    return await this.service.changeUsername(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-email')
  async changeEmail(@Body() data: any) {
    return await this.service.changeEmail(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-email/verify')
  async verifyEmailChange(@Body() data: any) {
    return await this.service.verifyEmailChange(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(@Body() data: any) {
    return await this.service.changePassword(data);
  }

  @UseGuards(AuthGuard)
  @Patch('change-phone-number')
  async changePhoneNumber(@Body() data: any) {
    return await this.service.changePhoneNumber(data);
  }

  @Post('check-unique')
  async checkUnique(@Body() data: any) {
    return await this.service.checkUnique(data);
  }
}
