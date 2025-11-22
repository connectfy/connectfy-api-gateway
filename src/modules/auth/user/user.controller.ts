import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@guards/auth.guard';
import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly service: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/me',
      payload: data,
    });

    return res;
  }
}
