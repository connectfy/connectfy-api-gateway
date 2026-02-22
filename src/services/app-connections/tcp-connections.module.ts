import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from 'connectfy-shared';

@Module({
  imports: [
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
        {
          name: MICROSERVICE_NAMES.ACCOUNT.TCP,
          transport: Transport.TCP,
          options: {
            host: 'account-service',
            port: 5000,
          },
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class TcpConnectionsModule {}
