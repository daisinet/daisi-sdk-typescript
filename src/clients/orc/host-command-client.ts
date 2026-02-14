import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  HostCommandsProtoDefinition,
  type HostCommandsProtoClient,
} from "../../generated/Protos/V1/Commands";
import type { Command } from "../../generated/Protos/V1/Models/CommandModels";

export class HostCommandClient {
  private client: HostCommandsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(HostCommandsProtoDefinition, channel);
  }

  /** Opens a bidirectional command stream. */
  open(commands: AsyncIterable<Partial<Command>>): AsyncIterable<Command> {
    return this.client.open(commands);
  }

  get raw(): HostCommandsProtoClient {
    return this.client;
  }
}
