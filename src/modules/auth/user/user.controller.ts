import { AuthGuard } from '@guards/auth.guard';
import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly service: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Body() data) {
    const res = await lastValueFrom(this.service.send('user/me', data));

    return res;
  }
}
