import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  CreditsProtoDefinition,
  type CreditsProtoClient,
} from "../../generated/Protos/V1/Credits";

export class CreditClient {
  private client: CreditsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(CreditsProtoDefinition, channel);
  }

  get raw(): CreditsProtoClient {
    return this.client;
  }
}
