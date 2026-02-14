import type { ClientMiddleware } from "nice-grpc-common";
import type { DaisiConfig } from "../../config";
import { getOrcUrl } from "../../config";
import type { TransportFactory } from "../../transport";
import { PeerClient } from "./peer-client";
import { PeerSessionManager } from "../../session/peer-session-manager";

export class PeerClientFactory {
  constructor(
    private config: DaisiConfig,
    private transportFactory: TransportFactory,
    private middleware: ClientMiddleware,
  ) {}

  create(): PeerClient {
    const sessionManager = new PeerSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
    });
    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    return new PeerClient(sessionManager, orcChannel, this.middleware);
  }

  createForHost(hostId: string): PeerClient {
    const sessionManager = new PeerSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
      hostId,
    });
    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    return new PeerClient(sessionManager, orcChannel, this.middleware);
  }
}
