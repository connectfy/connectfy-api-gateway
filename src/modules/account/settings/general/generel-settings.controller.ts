import { AuthGuard } from '@/src/guards/auth.guard';
import { SafeQueryGuard } from '@/src/guards/safeQuery.guard';
import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('account/settings/general-settings')
export class GeneralSettingsController {
  constructor(
    @Inject('ACCOUNT_SERVICE_TCP') private readonly service: ClientProxy,
  ) {}

  @Post('findOne')
  @UseGuards(AuthGuard, SafeQueryGuard)
  async findOne(@Body() data) {
    const res = await lastValueFrom(
      this.service.send('general-settings/findOne', data),
    );

    return res;
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(@Body() data) {
    const res = await lastValueFrom(
      this.service.send('general-settings/update', data),
    );

    return res;
  }
}
