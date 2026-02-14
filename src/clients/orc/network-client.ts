import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  NetworksProtoDefinition,
  type NetworksProtoClient,
} from "../../generated/Protos/V1/Networks";

export class NetworkClient {
  private client: NetworksProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(NetworksProtoDefinition, channel);
  }

  get raw(): NetworksProtoClient {
    return this.client;
  }
}
