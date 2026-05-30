import { PROCESSOR_NAME } from "#common/constants";
import { LoudnessProcessor } from "#modules/loudness-processor";

registerProcessor(PROCESSOR_NAME, LoudnessProcessor);
