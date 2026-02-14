import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  SettingsProtoDefinition,
  type SettingsProtoClient,
} from "../../generated/Protos/V1/Settings";
import type { SettingsSessionManager } from "../../session/settings-session-manager";

export class SettingsClient {
  private orcClient: SettingsProtoClient;
  private dcClient: SettingsProtoClient | null = null;

  public sessionManager: SettingsSessionManager;

  constructor(
    sessionManager: SettingsSessionManager,
    orcChannel: Channel,
    middleware: ClientMiddleware,
  ) {
    this.sessionManager = sessionManager;
    this.orcClient = createClientFactory().use(middleware).create(SettingsProtoDefinition, orcChannel);
  }

  private get activeClient(): SettingsProtoClient {
    if (this.sessionManager.useDirectConnect && this.dcClient) {
      return this.dcClient;
    }
    return this.orcClient;
  }

  setupDirectConnect(channel: Channel, middleware: ClientMiddleware): void {
    this.dcClient = createClientFactory().use(middleware).create(SettingsProtoDefinition, channel);
  }

  get raw(): SettingsProtoClient {
    return this.activeClient;
  }
}
