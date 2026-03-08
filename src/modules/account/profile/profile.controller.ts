import { AuthGuard } from '@/src/guards/auth.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';

@UseGuards(AuthGuard)
@Controller('account/profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Post('get')
  async getProfile() {
    return await this.service.getProfile();
  }
}
