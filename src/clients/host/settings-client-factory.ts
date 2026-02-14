import type { ClientMiddleware } from "nice-grpc-common";
import type { DaisiConfig } from "../../config";
import { getOrcUrl } from "../../config";
import type { TransportFactory } from "../../transport";
import { SettingsClient } from "./settings-client";
import { SettingsSessionManager } from "../../session/settings-session-manager";

export class SettingsClientFactory {
  constructor(
    private config: DaisiConfig,
    private transportFactory: TransportFactory,
    private middleware: ClientMiddleware,
  ) {}

  create(): SettingsClient {
    const sessionManager = new SettingsSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
    });
    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    return new SettingsClient(sessionManager, orcChannel, this.middleware);
  }

  createForHost(hostId: string): SettingsClient {
    const sessionManager = new SettingsSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
      hostId,
    });
    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    return new SettingsClient(sessionManager, orcChannel, this.middleware);
  }
}
