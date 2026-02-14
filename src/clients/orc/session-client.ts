import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  SessionsProtoDefinition,
  type SessionsProtoClient,
} from "../../generated/Protos/V1/Sessions";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  ClaimSessionRequest,
  ClaimSessionResponse,
  CloseSessionRequest,
  CloseSessionResponse,
  ConnectRequest,
  ConnectResponse,
} from "../../generated/Protos/V1/Models/SessionModels";
import type { DeepPartial } from "../../generated/Protos/V1/Sessions";

export class SessionClient {
  private client: SessionsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(SessionsProtoDefinition, channel);
  }

  async create(request: DeepPartial<CreateSessionRequest>): Promise<CreateSessionResponse> {
    return this.client.create(request);
  }

  async claim(request: DeepPartial<ClaimSessionRequest>): Promise<ClaimSessionResponse> {
    return this.client.claim(request);
  }

  async close(request: DeepPartial<CloseSessionRequest>): Promise<CloseSessionResponse> {
    return this.client.close(request);
  }

  async connect(request: DeepPartial<ConnectRequest>): Promise<ConnectResponse> {
    return this.client.connect(request);
  }
}
