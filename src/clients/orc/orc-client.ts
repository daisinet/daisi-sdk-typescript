import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  OrcsProtoDefinition,
  type OrcsProtoClient,
} from "../../generated/Protos/V1/Orcs";

export class OrcClient {
  private client: OrcsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(OrcsProtoDefinition, channel);
  }

  get raw(): OrcsProtoClient {
    return this.client;
  }
}
