import { describe, it, expect } from "vitest";
import {
  StaticClientKeyProvider,
  StaticDriveIdentityProvider,
} from "../src/auth/client-key-provider";

describe("StaticClientKeyProvider", () => {
  it("should return the client key", () => {
    const provider = new StaticClientKeyProvider("test-key-123");
    expect(provider.getClientKey()).toBe("test-key-123");
  });
});

describe("StaticDriveIdentityProvider", () => {
  it("should return all identity fields", () => {
    const provider = new StaticDriveIdentityProvider(
      "drive-key",
      "account-1",
      "user-1",
      "Alice",
      "admin",
    );
    expect(provider.getClientKey()).toBe("drive-key");
    expect(provider.getAccountId()).toBe("account-1");
    expect(provider.getUserId()).toBe("user-1");
    expect(provider.getUserName()).toBe("Alice");
    expect(provider.getUserRole()).toBe("admin");
  });
});
