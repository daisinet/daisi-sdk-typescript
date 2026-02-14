import type { SendInferenceRequest } from "../generated/Protos/V1/Models/InferenceModels";
import { ThinkLevels } from "../generated/Protos/V1/Models/InferenceModels";

/**
 * Creates a SendInferenceRequest with sensible defaults matching the .NET SDK defaults.
 */
export function createDefaultSendInferenceRequest(): Partial<SendInferenceRequest> {
  return {
    AntiPrompts: ["User:", "User:\n", "\n\n\n", "###"],
    DecodeSpecialTokens: false,
    FrequencyPenalty: 0.0,
    MaxTokens: 32000,
    MinKeep: 1,
    MinP: 0.1,
    PenalizeNewline: false,
    PenaltyCount: 64,
    PresencePenalty: 0.0,
    PreventEOS: false,
    RepeatPenalty: 1.1,
    Seed: Math.floor(Math.random() * 2147483647),
    Temperature: 0.7,
    TokensKeep: 16000,
    TopK: 40,
    TypicalP: 1.0,
    TopP: 0.9,
    ThinkLevel: ThinkLevels.ThinkLevelsBasic,
  };
}
