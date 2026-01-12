import { LoudnessProcessor } from "#processors";
import type { LoudnessMeasurements, LoudnessSnapshot } from "#types";

registerProcessor("loudness-processor", LoudnessProcessor);

export type { LoudnessMeasurements, LoudnessSnapshot };
