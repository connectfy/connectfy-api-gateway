import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@guards/auth.guard';
import {
  Body,
  Controller,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

@Controller('user')
export class UserController {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly service: ClientProxy,

    private readonly cls: ClsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/me',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @UseGuards(AuthGuard)
  @Patch('change-username')
  async changeUsername(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-username',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @UseGuards(AuthGuard)
  @Patch('change-email')
  async changeEmail(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-email',
      payload: data,
      cls: this.cls,
    });

    return res;
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-password',
      payload: data,
      cls: this.cls,
    });

    return res;
  }
}
