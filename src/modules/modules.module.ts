import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AccountModule, AuthModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ModulesModule {}
