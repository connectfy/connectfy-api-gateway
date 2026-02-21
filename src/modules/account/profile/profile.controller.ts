import { AuthGuard } from '@/src/guards/auth.guard';
import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CLS_KEYS,
  MICROSERVICE_NAMES,
  sendWithContext,
} from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@UseGuards(AuthGuard)
@Controller('account/profile')
export class ProfileController {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP)
    private readonly service: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  @Post('get')
  async getProfile() {
    const user = await this.cls.get(CLS_KEYS.USER);

    return await sendWithContext({
      client: this.service,
      endpoint: 'profile/findOne',
      payload: {
        query: {
          userId: user._id,
        },
      },
      cls: this.cls,
    });
  }
}
