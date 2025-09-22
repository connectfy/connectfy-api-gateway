import { Module } from '@nestjs/common';
import { AuthModule as AuthServiceModule } from './auth/auth.module';

@Module({ imports: [AuthServiceModule] })
export class AuthModule {}
