import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  HostsProtoDefinition,
  type HostsProtoClient,
} from "../../generated/Protos/V1/Hosts";

export class HostClient {
  private client: HostsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(HostsProtoDefinition, channel);
  }

  get raw(): HostsProtoClient {
    return this.client;
  }
}
