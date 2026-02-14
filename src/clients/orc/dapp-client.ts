import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  DappsProtoDefinition,
  type DappsProtoClient,
} from "../../generated/Protos/V1/Dapps";

export class DappClient {
  private client: DappsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(DappsProtoDefinition, channel);
  }

  get raw(): DappsProtoClient {
    return this.client;
  }
}
