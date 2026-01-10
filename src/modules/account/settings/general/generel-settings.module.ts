import { Module } from '@nestjs/common';
import { GeneralSettingsController } from './generel-settings.controller';
import { AuthGuard } from '@/src/guards/auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MICROSERVICE_NAMES } from '@/src/common/constants/constants';

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
      {
        name: MICROSERVICE_NAMES.ACCOUNT.TCP,
        transport: Transport.TCP,
        options: {
          host: 'account-service',
          port: 5000,
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [AuthGuard],
  controllers: [GeneralSettingsController],
})
export class GeneralSettingsModule {}
