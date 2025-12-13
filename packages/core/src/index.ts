import { LoudnessProcessor } from "#processors";
import type { LoudnessMetrics, LoudnessSnapshot } from "#types";

registerProcessor("loudness-processor", LoudnessProcessor);

export type { LoudnessMetrics, LoudnessSnapshot };
