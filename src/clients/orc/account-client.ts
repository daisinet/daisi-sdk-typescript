import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  AccountsProtoDefinition,
  type AccountsProtoClient,
} from "../../generated/Protos/V1/Accounts";

export class AccountClient {
  private client: AccountsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(AccountsProtoDefinition, channel);
  }

  get raw(): AccountsProtoClient {
    return this.client;
  }
}
