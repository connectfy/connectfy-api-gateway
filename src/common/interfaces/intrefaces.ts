import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

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
  cls?: ClsService;
}

export interface IEmitWithContextClientParams extends IEmitWithContextParams {
  client: ClientKafka;
  cls?: ClsService;
}
