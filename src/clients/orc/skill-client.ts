import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  SkillsProtoDefinition,
  type SkillsProtoClient,
} from "../../generated/Protos/V1/Skills";

export class SkillClient {
  private client: SkillsProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(SkillsProtoDefinition, channel);
  }

  get raw(): SkillsProtoClient {
    return this.client;
  }
}
