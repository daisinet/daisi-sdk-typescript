import { Status } from "nice-grpc-common";

export class DaisiError extends Error {
  public readonly code: Status;
  public readonly details?: string;

  constructor(message: string, code: Status = Status.UNKNOWN, details?: string) {
    super(message);
    this.name = "DaisiError";
    this.code = code;
    this.details = details;
  }
}

export class DaisiAuthenticationError extends DaisiError {
  constructor(message = "Authentication failed") {
    super(message, Status.UNAUTHENTICATED);
    this.name = "DaisiAuthenticationError";
  }
}

export class DaisiSessionError extends DaisiError {
  constructor(message = "Session error") {
    super(message, Status.FAILED_PRECONDITION);
    this.name = "DaisiSessionError";
  }
}

export class DaisiNotFoundError extends DaisiError {
  constructor(message = "Resource not found") {
    super(message, Status.NOT_FOUND);
    this.name = "DaisiNotFoundError";
  }
}

export class DaisiConnectionError extends DaisiError {
  constructor(message = "Connection failed") {
    super(message, Status.UNAVAILABLE);
    this.name = "DaisiConnectionError";
  }
}
