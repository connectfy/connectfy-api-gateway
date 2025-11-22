import { lastValueFrom } from 'rxjs';
import { ClsServiceManager } from 'nestjs-cls';
import {
  IEmitWithContextClientParams,
  ISendWithContextClientParams,
} from '../interfaces/intrefaces';

/**
 * Request/response wrapper
 */
export async function sendWithContext<TResponse = any>({
  client,
  endpoint,
  payload = {},
}: ISendWithContextClientParams): Promise<TResponse> {
  const cls = ClsServiceManager.getClsService();
  const user = cls?.get('user') || null;

  const enrichedPayload = {
    ...payload,
    _loggedUser: user,
  };

  return await lastValueFrom(client.send(endpoint, enrichedPayload));
}

/**
 * Fire-and-forget event wrapper (Kafka emit, RMQ emit, etc.)
 * Automatically attaches `_loggedUser` from CLS.
 */
export function emitWithContext({
  client,
  topic,
  payload = {},
}: IEmitWithContextClientParams) {
  const cls = ClsServiceManager.getClsService();
  const user = cls?.get('user') || null;

  const enrichedPayload = {
    ...payload,
    _loggedUser: user,
  };

  return client.emit(topic, enrichedPayload);
}
