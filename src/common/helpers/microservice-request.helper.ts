import { lastValueFrom, timeout } from 'rxjs';
import {
  IEmitWithContextClientParams,
  ISendWithContextClientParams,
} from '../interfaces/intrefaces';

/**
 * Request/response wrapper
 */
export async function sendWithContext<T = any>({
  client,
  endpoint,
  payload = {},
  cls,
}: ISendWithContextClientParams): Promise<T> {
  const contextData = cls ? cls.get('user') : null;
  const enrichedPayload = {
    ...payload,
    ...(contextData && { _loggedUser: contextData }),
  };

  return lastValueFrom(
    client.send(endpoint, enrichedPayload).pipe(timeout(5000)),
  );
}

/**
 * Fire-and-forget event wrapper (Kafka emit, RMQ emit, etc.)
 * Automatically attaches `_loggedUser` from CLS.
 */
export function emitWithContext<T = any>({
  client,
  topic,
  payload = {},
  cls,
}: IEmitWithContextClientParams): Promise<T> {
  const user = cls ? cls.get('user') : null;

  const enrichedPayload = {
    ...payload,
    _loggedUser: user,
  };

  return lastValueFrom(client.emit(topic, enrichedPayload).pipe(timeout(5000)));
}
