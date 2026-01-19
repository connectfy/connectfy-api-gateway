import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule as AuthServiceModule } from './auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from '@common/constants/constants';

@Module({
  imports: [
    AuthServiceModule,
    UserModule,
    ClientsModule.register({
      clients: [
        {
          name: MICROSERVICE_NAMES.AUTH.TCP,
          transport: Transport.TCP,
          options: {
            host: 'auth-service',
            port: 4000,
          },
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class AuthModule {}
