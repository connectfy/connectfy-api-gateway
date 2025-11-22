import { ClientKafka, ClientProxy } from '@nestjs/microservices';

interface ISendWithContextParams {
  endpoint: string;
  payload?: any;
}

interface IEmitWithContextParams {
  topic: string;
  payload?: any;
}

export interface ISendWithContextClientParams extends ISendWithContextParams {
  client: ClientProxy;
}

export interface IEmitWithContextClientParams extends IEmitWithContextParams {
  client: ClientKafka;
}
