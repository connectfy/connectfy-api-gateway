import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { AuthGuard } from '@/src/guards/auth.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { CLS_KEYS } from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@UseGuards(AuthGuard)
@Controller('account/profile')
export class ProfileController {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cls: ClsService,
  ) {}

  @Post('get')
  async getProfile() {
    const user = await this.cls.get(CLS_KEYS.USER);

    return await this.tcpConnectionService.account({
      endpoint: 'profile/findOne',
      payload: {
        query: {
          userId: user._id,
        },
      },
    });
  }
}
