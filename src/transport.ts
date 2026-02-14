import type { ClientMiddleware } from "nice-grpc-common";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransportFactory {
  createChannel(address: string): any;
}

export interface TransportOptions {
  factory: TransportFactory;
  middleware?: ClientMiddleware;
}
