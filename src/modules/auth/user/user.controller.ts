import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@guards/auth.guard';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Inject,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

@Controller('user')
export class UserController {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly service: ClientProxy,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly cls: ClsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Body() data, @Req() request) {
    const reqUser = request.user;

    if (reqUser) {
      const cacheKey = `user:${reqUser.user._id}`;

      const cachedUser = await this.cacheService.get(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
    }

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
  @Patch('change-email/verify')
  async verifyEmailChange(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-email/verify',
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

  @UseGuards(AuthGuard)
  @Patch('change-phone-number')
  async changePhoneNumber(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'user/change-phone-number',
      payload: data,
      cls: this.cls,
    });

    return res;
  }
}
