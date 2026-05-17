import type {
  LoudnessMeasurements,
  LoudnessProcessorOptions,
  LoudnessSnapshot,
} from "#common/types";
import { LoudnessProcessor } from "#modules/loudness-processor";

registerProcessor("loudness-processor", LoudnessProcessor);

export type {
  LoudnessMeasurements,
  LoudnessSnapshot,
  LoudnessProcessorOptions,
};
