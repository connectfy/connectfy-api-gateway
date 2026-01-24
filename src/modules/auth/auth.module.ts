import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule as AuthServiceModule } from './auth/auth.module';

@Module({
  imports: [AuthServiceModule, UserModule],
})
export class AuthModule {}
