import { AuthGuard } from '@guards/auth.guard';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor() {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Req() request) {
    return request.user;
  }
}
