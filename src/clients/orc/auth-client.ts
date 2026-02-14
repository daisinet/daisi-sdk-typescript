import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  AuthProtoDefinition,
  type AuthProtoClient,
} from "../../generated/Protos/V1/Auth";
import type {
  CreateClientKeyRequest,
  CreateClientKeyResponse,
  ValidateClientKeyRequest,
  ValidateClientKeyResponse,
  SendAuthCodeRequest,
  SendAuthCodeResponse,
  ValidateAuthCodeRequest,
  ValidateAuthCodeResponse,
  GetAuthenticatedUserRequest,
  GetAuthenticatedUserResponse,
  DeleteClientKeyRequest,
  DeleteClientKeyResponse,
} from "../../generated/Protos/V1/Models/AuthModels";
import type { DeepPartial } from "../../generated/Protos/V1/Auth";

export class AuthClient {
  private client: AuthProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(AuthProtoDefinition, channel);
  }

  async createClientKey(
    request: DeepPartial<CreateClientKeyRequest>,
  ): Promise<CreateClientKeyResponse> {
    return this.client.createClientKey(request);
  }

  async validateClientKey(
    request: DeepPartial<ValidateClientKeyRequest>,
  ): Promise<ValidateClientKeyResponse> {
    return this.client.validateClientKey(request);
  }

  async sendAuthCode(
    request: DeepPartial<SendAuthCodeRequest>,
  ): Promise<SendAuthCodeResponse> {
    return this.client.sendAuthCode(request);
  }

  async validateAuthCode(
    request: DeepPartial<ValidateAuthCodeRequest>,
  ): Promise<ValidateAuthCodeResponse> {
    return this.client.validateAuthCode(request);
  }

  async getAuthenticatedUser(
    request: DeepPartial<GetAuthenticatedUserRequest>,
  ): Promise<GetAuthenticatedUserResponse> {
    return this.client.getAuthenticatedUser(request);
  }

  async deleteClientKey(
    request: DeepPartial<DeleteClientKeyRequest>,
  ): Promise<DeleteClientKeyResponse> {
    return this.client.deleteClientKey(request);
  }
}
