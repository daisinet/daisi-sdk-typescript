import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  DriveNotificationProtoDefinition,
  type DriveNotificationProtoClient,
} from "../../generated/Protos/V1/DriveNotification";

export class DriveNotificationClient {
  private client: DriveNotificationProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(DriveNotificationProtoDefinition, channel);
  }

  get raw(): DriveNotificationProtoClient {
    return this.client;
  }
}
