import { describe, it, expect } from "vitest";
import { Status } from "nice-grpc-common";
import {
  DaisiError,
  DaisiAuthenticationError,
  DaisiSessionError,
  DaisiNotFoundError,
  DaisiConnectionError,
} from "../src/errors";

describe("DaisiError", () => {
  it("should create base error with defaults", () => {
    const err = new DaisiError("test");
    expect(err.message).toBe("test");
    expect(err.name).toBe("DaisiError");
    expect(err.code).toBe(Status.UNKNOWN);
    expect(err).toBeInstanceOf(Error);
  });

  it("should create error with custom code", () => {
    const err = new DaisiError("test", Status.INTERNAL, "extra details");
    expect(err.code).toBe(Status.INTERNAL);
    expect(err.details).toBe("extra details");
  });
});

describe("DaisiAuthenticationError", () => {
  it("should default message and code", () => {
    const err = new DaisiAuthenticationError();
    expect(err.message).toBe("Authentication failed");
    expect(err.code).toBe(Status.UNAUTHENTICATED);
    expect(err.name).toBe("DaisiAuthenticationError");
  });
});

describe("DaisiSessionError", () => {
  it("should default message and code", () => {
    const err = new DaisiSessionError();
    expect(err.message).toBe("Session error");
    expect(err.code).toBe(Status.FAILED_PRECONDITION);
  });
});

describe("DaisiNotFoundError", () => {
  it("should default message and code", () => {
    const err = new DaisiNotFoundError();
    expect(err.message).toBe("Resource not found");
    expect(err.code).toBe(Status.NOT_FOUND);
  });
});

describe("DaisiConnectionError", () => {
  it("should default message and code", () => {
    const err = new DaisiConnectionError();
    expect(err.message).toBe("Connection failed");
    expect(err.code).toBe(Status.UNAVAILABLE);
  });
});
