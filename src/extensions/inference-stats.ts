import type { InferenceStatsResponse } from "../generated/Protos/V1/Models/InferenceModels";

/** Computes tokens per second for the last message. */
export function getLastMessageTokensPerSecond(stats: InferenceStatsResponse): number {
  if (!stats.LastMessageComputeTimeMs || stats.LastMessageComputeTimeMs === 0) {
    return 0;
  }
  return (stats.LastMessageTokenCount ?? 0) / (stats.LastMessageComputeTimeMs / 1000);
}

/** Computes tokens per second for the entire session. */
export function getSessionTokensPerSecond(stats: InferenceStatsResponse): number {
  if (!stats.SessionComputeTimeMs || stats.SessionComputeTimeMs === 0) {
    return 0;
  }
  return (stats.SessionTokenCount ?? 0) / (stats.SessionComputeTimeMs / 1000);
}
