import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  ReleasesProtoDefinition,
  type ReleasesProtoClient,
} from "../../generated/Protos/V1/Releases";

export class ReleaseClient {
  private client: ReleasesProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(ReleasesProtoDefinition, channel);
  }

  get raw(): ReleasesProtoClient {
    return this.client;
  }
}
