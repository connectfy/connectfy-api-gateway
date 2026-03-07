import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ISendWithContextClientParams,
  MICROSERVICE_NAMES,
  sendWithContext,
} from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TcpConnectionService {
  constructor(
    private readonly cls: ClsService,

    @Inject(MICROSERVICE_NAMES.TCP.AUTH)
    private readonly authService: ClientProxy,

    @Inject(MICROSERVICE_NAMES.TCP.ACCOUNT)
    private readonly accountService: ClientProxy,

    @Inject(MICROSERVICE_NAMES.TCP.MESSENGER)
    private readonly messengerService: ClientProxy,

    @Inject(MICROSERVICE_NAMES.TCP.RELATIONSHIP)
    private readonly relationshipService: ClientProxy,

    @Inject(MICROSERVICE_NAMES.TCP.NOTIFICATION_ACTION_HISTORY)
    private readonly notificationActionHistoryService: ClientProxy,
  ) {}

  // ===============================
  // Main send method
  // ===============================
  private async sendTcpWithContext({
    client,
    endpoint,
    payload,
  }: ISendWithContextClientParams) {
    return await sendWithContext({
      client,
      endpoint,
      payload,
      cls: this.cls,
    });
  }

  // ===============================
  // Auth service
  // ===============================
  async auth(opts: Omit<ISendWithContextClientParams, 'client' | 'cls'>) {
    return await this.sendTcpWithContext({
      client: this.authService,
      ...opts,
    });
  }

  // ===============================
  // Account service
  // ===============================
  async account(opts: Omit<ISendWithContextClientParams, 'client' | 'cls'>) {
    return await this.sendTcpWithContext({
      client: this.accountService,
      ...opts,
    });
  }

  // ===============================
  // Messenger service
  // ===============================
  async messenger(opts: Omit<ISendWithContextClientParams, 'client' | 'cls'>) {
    return await this.sendTcpWithContext({
      client: this.messengerService,
      ...opts,
    });
  }

  // ===============================
  // Relationship service
  // ===============================
  async relationship(
    opts: Omit<ISendWithContextClientParams, 'client' | 'cls'>,
  ) {
    return await this.sendTcpWithContext({
      client: this.relationshipService,
      ...opts,
    });
  }

  // ===============================
  // Notification action history service
  // ===============================
  async notificationActionHistory(
    opts: Omit<ISendWithContextClientParams, 'client' | 'cls'>,
  ) {
    return await this.sendTcpWithContext({
      client: this.notificationActionHistoryService,
      ...opts,
    });
  }
}
