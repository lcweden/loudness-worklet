export interface LoudnessWorkletOptions extends AudioWorkletNodeOptions {
  processorOptions: {
    shared: boolean;
    buffers?: SharedArrayBuffer[];
  };
}

export interface LoudnessOptions extends AudioNodeOptions {
  numberOfInputs?: number;
}

export type LoudnessSnapshot = {
  currentFrame: number;
  currentTime: number;
  momentaryLoudness: number;
  shortTermLoudness: number;
  integratedLoudness: number;
  maximumMomentaryLoudness: number;
  maximumShortTermLoudness: number;
  loudnessRange: number;
  truePeak: number;
};
