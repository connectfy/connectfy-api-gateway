import { Global, Module } from '@nestjs/common';
import { TcpConnectionsModule } from './tcp-connections/tcp-connections.module';
import { KafkaConnectionsModule } from './kafka-connections/kafka-connections.module';

@Global()
@Module({
  imports: [TcpConnectionsModule, KafkaConnectionsModule],
  controllers: [],
  providers: [],
  exports: [TcpConnectionsModule, KafkaConnectionsModule],
})
export class AppSettingsModule {}
