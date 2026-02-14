import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  AppCommandsProtoDefinition,
  type AppCommandsProtoClient,
} from "../../generated/Protos/V1/Commands";
import type { Command } from "../../generated/Protos/V1/Models/CommandModels";

export class AppCommandClient {
  private client: AppCommandsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(AppCommandsProtoDefinition, channel);
  }

  /** Opens a bidirectional command stream. */
  open(commands: AsyncIterable<Partial<Command>>): AsyncIterable<Command> {
    return this.client.open(commands);
  }

  get raw(): AppCommandsProtoClient {
    return this.client;
  }
}
