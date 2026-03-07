import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from 'connectfy-shared';
import { TcpConnectionService } from './tcp-connection.service';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';

@Global()
@Module({
  imports: [
    ClientsModule.register({
      clients: [
        {
          name: MICROSERVICE_NAMES.TCP.AUTH,
          transport: Transport.TCP,
          options: {
            host: ENVIRONMENT_VARIABLES.AUTH_SERVICE_HOST,
            port: ENVIRONMENT_VARIABLES.AUTH_SERVICE_PORT,
          },
        },
        {
          name: MICROSERVICE_NAMES.TCP.ACCOUNT,
          transport: Transport.TCP,
          options: {
            host: ENVIRONMENT_VARIABLES.ACCOUNT_SERVICE_HOST,
            port: ENVIRONMENT_VARIABLES.ACCOUNT_SERVICE_PORT,
          },
        },
        {
          name: MICROSERVICE_NAMES.TCP.MESSENGER,
          transport: Transport.TCP,
          options: {
            host: ENVIRONMENT_VARIABLES.MESSENGER_SERVICE_HOST,
            port: ENVIRONMENT_VARIABLES.MESSENGER_SERVICE_PORT,
          },
        },
        {
          name: MICROSERVICE_NAMES.TCP.RELATIONSHIP,
          transport: Transport.TCP,
          options: {
            host: ENVIRONMENT_VARIABLES.RELATIONSHIP_SERVICE_HOST,
            port: ENVIRONMENT_VARIABLES.RELATIONSHIP_SERVICE_PORT,
          },
        },
        {
          name: MICROSERVICE_NAMES.TCP.NOTIFICATION_ACTION_HISTORY,
          transport: Transport.TCP,
          options: {
            host: ENVIRONMENT_VARIABLES.NOTIFICATION_ACTION_HISTORY_SERVICE_HOST,
            port: ENVIRONMENT_VARIABLES.NOTIFICATION_ACTION_HISTORY_SERVICE_PORT,
          },
        },
      ],
      isGlobal: true,
    }),
  ],
  providers: [TcpConnectionService],
  exports: [TcpConnectionService],
})
export class TcpConnectionModule {}
