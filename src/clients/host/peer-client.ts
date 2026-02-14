import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  PeersProtoDefinition,
  type PeersProtoClient,
} from "../../generated/Protos/V1/Peers";
import type { PeerSessionManager } from "../../session/peer-session-manager";

export class PeerClient {
  private orcClient: PeersProtoClient;
  private dcClient: PeersProtoClient | null = null;

  public sessionManager: PeerSessionManager;

  constructor(
    sessionManager: PeerSessionManager,
    orcChannel: Channel,
    middleware: ClientMiddleware,
  ) {
    this.sessionManager = sessionManager;
    this.orcClient = createClientFactory().use(middleware).create(PeersProtoDefinition, orcChannel);
  }

  private get activeClient(): PeersProtoClient {
    if (this.sessionManager.useDirectConnect && this.dcClient) {
      return this.dcClient;
    }
    return this.orcClient;
  }

  setupDirectConnect(channel: Channel, middleware: ClientMiddleware): void {
    this.dcClient = createClientFactory().use(middleware).create(PeersProtoDefinition, channel);
  }

  get raw(): PeersProtoClient {
    return this.activeClient;
  }
}
