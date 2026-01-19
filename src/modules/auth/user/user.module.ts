import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthGuard } from '@guards/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuthGuard],
  controllers: [UserController],
})
export class UserModule {}
