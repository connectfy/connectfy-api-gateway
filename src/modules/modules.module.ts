import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [AccountModule, AuthModule, AppCacheModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ModulesModule {}
