import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  MarketplaceProtoDefinition,
  type MarketplaceProtoClient,
} from "../../generated/Protos/V1/Marketplace";

export class MarketplaceClient {
  private client: MarketplaceProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(MarketplaceProtoDefinition, channel);
  }

  get raw(): MarketplaceProtoClient {
    return this.client;
  }
}
