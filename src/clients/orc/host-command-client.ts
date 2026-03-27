import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  HostCommandsProtoDefinition,
  type HostCommandsProtoClient,
} from "../../generated/Protos/V1/Commands";
import type { Command, SendCommandResponse } from "../../generated/Protos/V1/Models/CommandModels";

export class HostCommandClient {
  private client: HostCommandsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(HostCommandsProtoDefinition, channel);
  }

  /** Opens a bidirectional command stream (native hosts). */
  open(commands: AsyncIterable<Partial<Command>>): AsyncIterable<Command> {
    return this.client.open(commands);
  }

  /** Server-stream: receive commands from ORC (browser hosts via grpc-web). */
  listenForCommands(options?: { signal?: AbortSignal }): AsyncIterable<Command> {
    return this.client.listenForCommands({}, options);
  }

  /** Unary: send a command to ORC (browser hosts via grpc-web). */
  async sendCommand(command: Partial<Command>): Promise<SendCommandResponse> {
    return this.client.sendCommand({ Command: command as Command });
  }

  get raw(): HostCommandsProtoClient {
    return this.client;
  }
}
