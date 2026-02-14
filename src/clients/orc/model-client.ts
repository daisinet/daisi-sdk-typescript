import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  ModelsProtoDefinition,
  type ModelsProtoClient,
} from "../../generated/Protos/V1/Models";

export class ModelClient {
  private client: ModelsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(ModelsProtoDefinition, channel);
  }

  get raw(): ModelsProtoClient {
    return this.client;
  }
}
