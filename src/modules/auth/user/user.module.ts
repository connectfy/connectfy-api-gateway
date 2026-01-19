import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthGuard } from '@guards/auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MICROSERVICE_NAMES } from '@/src/common/constants/constants';
import { AppCacheModule } from '@modules/cache/cache.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_NAMES.AUTH.TCP,
        transport: Transport.TCP,
        options: {
          host: 'auth-service',
          port: 4000,
        },
      },
    ]),
    ConfigModule,
    AppCacheModule,
  ],
  providers: [AuthGuard],
  controllers: [UserController],
})
export class UserModule {}
