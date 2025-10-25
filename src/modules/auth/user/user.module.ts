import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthGuard } from '@guards/auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE_TCP',
        transport: Transport.TCP,
        options: {
          host: 'auth-service',
          port: 4000,
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [AuthGuard],
  controllers: [UserController],
})
export class UserModule {}
