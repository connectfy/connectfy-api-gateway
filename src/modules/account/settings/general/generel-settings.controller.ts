import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthGuard } from '@/src/guards/auth.guard';
import { SafeQueryGuard } from '@/src/guards/safeQuery.guard';
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

@Controller('account/settings/general-settings')
export class GeneralSettingsController {
  constructor(
    @Inject('ACCOUNT_SERVICE_TCP') private readonly service: ClientProxy,

    private readonly cls: ClsService
  ) {}

  @Post('findOne')
  @UseGuards(AuthGuard, SafeQueryGuard)
  async findOne(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'general-settings/findOne',
      payload: data,
      cls: this.cls
    });

    return res;
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(@Body() data) {
    const res = await sendWithContext({
      client: this.service,
      endpoint: 'general-settings/update',
      payload: data,
      cls: this.cls
    });

    return res;
  }
}
