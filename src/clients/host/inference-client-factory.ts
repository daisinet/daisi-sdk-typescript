import type { Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import type { DaisiConfig } from "../../config";
import { getOrcUrl } from "../../config";
import type { TransportFactory } from "../../transport";
import { InferenceClient } from "./inference-client";
import { InferenceSessionManager } from "../../session/inference-session-manager";

export class InferenceClientFactory {
  constructor(
    private config: DaisiConfig,
    private transportFactory: TransportFactory,
    private middleware: ClientMiddleware,
  ) {}

  /** Create an inference client, letting the Orc choose the host. */
  create(): InferenceClient {
    const sessionManager = new InferenceSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
    });

    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    const client = new InferenceClient(sessionManager, orcChannel, this.middleware);

    return client;
  }

  /** Create an inference client targeting a specific host by ID. */
  createForHost(hostId: string): InferenceClient {
    const sessionManager = new InferenceSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
      hostId,
    });

    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    const client = new InferenceClient(sessionManager, orcChannel, this.middleware);

    return client;
  }

  /** Create an inference client targeting a specific host by address. */
  createForAddress(hostIp: string, hostPort: number): InferenceClient {
    const sessionManager = new InferenceSessionManager({
      config: this.config,
      transportFactory: this.transportFactory,
      middleware: this.middleware,
    });

    const orcChannel = this.transportFactory.createChannel(getOrcUrl(this.config));
    const client = new InferenceClient(sessionManager, orcChannel, this.middleware);

    // Set up direct connect to the host address
    const protocol = hostIp === this.config.orcAddress ? (this.config.orcUseSsl ? "https" : "http") : "http";
    const dcChannel = this.transportFactory.createChannel(`${protocol}://${hostIp}:${hostPort}`);
    client.setupDirectConnect(dcChannel, this.middleware);

    return client;
  }
}
