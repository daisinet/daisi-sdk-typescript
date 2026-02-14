import type { Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import type { DaisiConfig } from "../config";
import { getOrcUrl } from "../config";
import { DaisiConnectionError, DaisiSessionError } from "../errors";
import type { TransportFactory } from "../transport";
import type { SessionsProtoClient } from "../generated/Protos/V1/Sessions";
import { SessionsProtoDefinition } from "../generated/Protos/V1/Sessions";
import type {
  CreateSessionRequest,
  ConnectResponse,
} from "../generated/Protos/V1/Models/SessionModels";

export interface SessionManagerOptions {
  config: DaisiConfig;
  transportFactory: TransportFactory;
  middleware: ClientMiddleware;
  hostId?: string;
}

export abstract class SessionManager {
  protected sessionClient: SessionsProtoClient;
  protected connectResponse: ConnectResponse | null = null;
  protected _directConnectChannel: Channel | null = null;

  public sessionId: string | null = null;
  public hostId?: string;

  protected config: DaisiConfig;
  protected transportFactory: TransportFactory;
  protected middleware: ClientMiddleware;

  constructor(options: SessionManagerOptions) {
    this.config = options.config;
    this.transportFactory = options.transportFactory;
    this.middleware = options.middleware;
    this.hostId = options.hostId;
    this.sessionClient = this.createSessionClient();
  }

  private createSessionClient(): SessionsProtoClient {
    // Dynamic import avoidance — we use the factory passed in
    const channel = this.transportFactory.createChannel(getOrcUrl(this.config));
    // We import createClient at the caller level. For the session manager we use
    // a minimal approach: store the channel and create the client.
    // The actual createClient call is handled by the concrete transport.
    return this._createGrpcClient(SessionsProtoDefinition, channel);
  }

  protected abstract _createGrpcClient<D>(definition: D, channel: Channel): any;

  get useDirectConnect(): boolean {
    return this._directConnectChannel !== null;
  }

  get directConnectChannel(): Channel | null {
    return this._directConnectChannel;
  }

  async negotiateSession(request?: Partial<CreateSessionRequest>): Promise<void> {
    if (this.sessionId !== null) return;

    const createRequest: Partial<CreateSessionRequest> = {
      ...request,
      NetworkName: request?.NetworkName ?? this.config.networkName,
    };

    if (this.hostId) {
      createRequest.HostId = this.hostId;
    }

    const sessionResponse = await this.sessionClient.create(createRequest);

    // Handle MoveToOrc redirect
    if (sessionResponse.MoveToOrc) {
      this.config = {
        ...this.config,
        orcAddress: sessionResponse.MoveToOrc.Domain,
        orcPort: sessionResponse.MoveToOrc.Port,
      };
      this.sessionClient = this.createSessionClient();
      return this.negotiateSession(request);
    }

    if (!sessionResponse.Id) {
      throw new DaisiSessionError("Failed to create session — no session ID returned");
    }

    this.sessionId = sessionResponse.Id;

    // Connect to the session
    const connectResponse = await this.sessionClient.connect({
      SessionId: this.sessionId,
    });
    this.connectResponse = connectResponse;

    if (!this.checkIsConnected()) {
      throw new DaisiConnectionError("Could not connect to session");
    }

    // Set up Direct Connect if host supports it
    if (sessionResponse.Host?.DirectConnect) {
      const host = sessionResponse.Host;
      const protocol = host.IpAddress === this.config.orcAddress ? (this.config.orcUseSsl ? "https" : "http") : "http";
      this._directConnectChannel = this.transportFactory.createChannel(
        `${protocol}://${host.IpAddress}:${host.Port}`,
      );
    }
  }

  checkIsConnected(): boolean {
    return this.connectResponse !== null && !!this.connectResponse.Id;
  }

  async close(): Promise<void> {
    if (this.sessionClient && this.sessionId) {
      await this.sessionClient.close({ Id: this.sessionId });
      this.connectResponse = null;
      this.sessionId = null;
    }
  }

  abstract createNewInstance(hostId?: string): SessionManager;
}
