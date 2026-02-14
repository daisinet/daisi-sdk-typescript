import { describe, it, expect } from "vitest";
import { resolveConfig, getOrcUrl, DEFAULT_CONFIG } from "../src/config";

describe("config", () => {
  it("should have correct defaults", () => {
    expect(DEFAULT_CONFIG.orcAddress).toBe("orc.daisinet.com");
    expect(DEFAULT_CONFIG.orcPort).toBe(443);
    expect(DEFAULT_CONFIG.orcUseSsl).toBe(true);
    expect(DEFAULT_CONFIG.networkName).toBe("devnet");
  });

  it("should resolve config with defaults", () => {
    const config = resolveConfig();
    expect(config.orcAddress).toBe("orc.daisinet.com");
    expect(config.orcPort).toBe(443);
  });

  it("should override defaults with provided options", () => {
    const config = resolveConfig({
      orcAddress: "custom-orc.example.com",
      orcPort: 8443,
      networkName: "mainnet",
    });
    expect(config.orcAddress).toBe("custom-orc.example.com");
    expect(config.orcPort).toBe(8443);
    expect(config.networkName).toBe("mainnet");
    expect(config.orcUseSsl).toBe(true); // keeps default
  });

  it("should generate correct ORC URL with SSL", () => {
    const config = resolveConfig();
    expect(getOrcUrl(config)).toBe("https://orc.daisinet.com:443");
  });

  it("should generate correct ORC URL without SSL", () => {
    const config = resolveConfig({ orcUseSsl: false });
    expect(getOrcUrl(config)).toBe("http://orc.daisinet.com:443");
  });

  it("should generate correct ORC URL with custom address", () => {
    const config = resolveConfig({
      orcAddress: "192.168.1.100",
      orcPort: 5000,
      orcUseSsl: false,
    });
    expect(getOrcUrl(config)).toBe("http://192.168.1.100:5000");
  });
});
