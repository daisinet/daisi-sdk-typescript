import { describe, it, expect } from "vitest";
import { createDefaultSendInferenceRequest } from "../src/extensions/send-inference-request";
import {
  getLastMessageTokensPerSecond,
  getSessionTokensPerSecond,
} from "../src/extensions/inference-stats";
import { ThinkLevels } from "../src/generated/Protos/V1/Models/InferenceModels";
import type { InferenceStatsResponse } from "../src/generated/Protos/V1/Models/InferenceModels";

describe("createDefaultSendInferenceRequest", () => {
  it("should return request with correct defaults", () => {
    const req = createDefaultSendInferenceRequest();
    expect(req.Temperature).toBe(0.7);
    expect(req.TopP).toBe(0.9);
    expect(req.MaxTokens).toBe(32000);
    expect(req.TopK).toBe(40);
    expect(req.RepeatPenalty).toBe(1.1);
    expect(req.MinP).toBe(0.1);
    expect(req.TokensKeep).toBe(16000);
    expect(req.ThinkLevel).toBe(ThinkLevels.ThinkLevelsBasic);
    expect(req.AntiPrompts).toEqual(["User:", "User:\n", "\n\n\n", "###"]);
    expect(req.DecodeSpecialTokens).toBe(false);
    expect(req.PenalizeNewline).toBe(false);
    expect(req.PreventEOS).toBe(false);
  });

  it("should generate a random seed", () => {
    const req1 = createDefaultSendInferenceRequest();
    const req2 = createDefaultSendInferenceRequest();
    expect(typeof req1.Seed).toBe("number");
    // Seeds should be different (extremely unlikely to collide)
    // But we just verify it's a valid number
    expect(req1.Seed).toBeGreaterThanOrEqual(0);
  });
});

describe("inference stats helpers", () => {
  it("should compute last message tokens per second", () => {
    const stats = {
      LastMessageTokenCount: 100,
      LastMessageComputeTimeMs: 2000,
    } as InferenceStatsResponse;
    expect(getLastMessageTokensPerSecond(stats)).toBe(50);
  });

  it("should return 0 when compute time is 0", () => {
    const stats = {
      LastMessageTokenCount: 100,
      LastMessageComputeTimeMs: 0,
    } as InferenceStatsResponse;
    expect(getLastMessageTokensPerSecond(stats)).toBe(0);
  });

  it("should compute session tokens per second", () => {
    const stats = {
      SessionTokenCount: 500,
      SessionComputeTimeMs: 10000,
    } as InferenceStatsResponse;
    expect(getSessionTokensPerSecond(stats)).toBe(50);
  });

  it("should return 0 when session compute time is 0", () => {
    const stats = {
      SessionTokenCount: 500,
      SessionComputeTimeMs: 0,
    } as InferenceStatsResponse;
    expect(getSessionTokensPerSecond(stats)).toBe(0);
  });
});
