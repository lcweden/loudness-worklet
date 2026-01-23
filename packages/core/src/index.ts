import { LoudnessProcessor } from "#processors";
import type {
  LoudnessMeasurements,
  LoudnessSnapshot,
  LoudnessProcessorOptions,
} from "#types";

registerProcessor("loudness-processor", LoudnessProcessor);

export type {
  LoudnessMeasurements,
  LoudnessSnapshot,
  LoudnessProcessorOptions,
};
