import { Global, Module } from '@nestjs/common';
import { TcpConnectionModule } from './tcp-connections/tcp-connection.module';

@Global()
@Module({
  imports: [TcpConnectionModule],
  controllers: [],
  providers: [],
  exports: [TcpConnectionModule],
})
export class AppSettingsModule {}
