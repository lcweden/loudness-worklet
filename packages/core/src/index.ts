import { LoudnessProcessor } from "#processors";
import type {
  LoudnessMeasurements,
  LoudnessProcessorOptions,
  LoudnessSnapshot,
} from "#types";

registerProcessor("loudness-processor", LoudnessProcessor);

export type {
  LoudnessMeasurements,
  LoudnessSnapshot,
  LoudnessProcessorOptions,
};
