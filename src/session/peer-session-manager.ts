import type { Channel } from "nice-grpc";
import { createClientFactory } from "nice-grpc";
import { SessionManager, type SessionManagerOptions } from "./session-manager";

export class PeerSessionManager extends SessionManager {
  constructor(options: SessionManagerOptions) {
    super(options);
  }

  protected _createGrpcClient<D>(definition: D, channel: Channel): any {
    return createClientFactory().use(this.middleware).create(definition as any, channel);
  }

  createNewInstance(hostId?: string): PeerSessionManager {
    return new PeerSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
      hostId,
    });
  }
}
