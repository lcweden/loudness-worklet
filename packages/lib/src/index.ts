import { PROCESSOR_NAME } from "#common/constants";
import type { LoudnessProcessorOptions } from "#common/types";
import type { LoudnessMeasurements, LoudnessSnapshot } from "#common/types";

type LoudnessWorkletProcessorOptions = {
  numberOfInputs?: AudioWorkletNodeOptions["numberOfInputs"];
  numberOfOutputs?: AudioWorkletNodeOptions["numberOfOutputs"];
  outputChannelCount?: AudioWorkletNodeOptions["outputChannelCount"];
  processorOptions?: LoudnessProcessorOptions;
};

class LoudnessWorkletNode extends AudioWorkletNode {
  constructor(context: BaseAudioContext, options?: LoudnessWorkletProcessorOptions) {
    super(context, PROCESSOR_NAME, options);
  }
}

function createLoudnessWorklet(
  context: BaseAudioContext,
  options?: LoudnessWorkletProcessorOptions,
): AudioWorkletNode {
  const { processorOptions } = options || {};
  return new LoudnessWorkletNode(context, { processorOptions });
}

export { createLoudnessWorklet };
export default LoudnessWorkletNode;
export type { LoudnessWorkletProcessorOptions };
export type { LoudnessMeasurements, LoudnessProcessorOptions, LoudnessSnapshot };
