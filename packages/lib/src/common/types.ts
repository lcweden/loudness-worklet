/**
 * Options for initializing the LoudnessProcessor inside the AudioWorklet thread.
 */
export interface LoudnessWorkletOptions extends AudioWorkletNodeOptions {
  processorOptions: {
    /**
     * Indicates whether cross-origin isolation is active, allowing the use of SharedArrayBuffer for
     * zero-allocation, lock-free cross-thread communication.
     */
    shared: boolean;
    /**
     * Pre-allocated SharedArrayBuffers for each input channel.
     */
    buffers?: SharedArrayBuffer[];
  };
}

/**
 * Options for creating a LoudnessNode on the main thread.
 */
export interface LoudnessOptions extends AudioNodeOptions {
  /**
   * The number of independent audio inputs to analyze concurrently.
   *
   * @default 1
   */
  numberOfInputs?: number;
}

/**
 * A real-time snapshot of loudness metrics calculated according to ITU-R and EBU standards.
 */
export type LoudnessSnapshot = {
  /**
   * The current frame index processed by the audio context.
   */
  currentFrame: number;

  /**
   * The current time of the audio context.
   */
  currentTime: number;

  /**
   * Loudness Range is a statistical measure of loudness variation, difference between the 95th and
   * 10th percentiles of the short-term loudness.
   */
  loudnessRange: number;

  /**
   * Momentary Loudness computed over a 400ms sliding window.
   */
  momentaryLoudness: number;

  /**
   * Short-Term Loudness computed over a 3s sliding window.
   */
  shortTermLoudness: number;

  /**
   * Integrated Loudness overall program loudness using absolute and relative gating.
   */
  integratedLoudness: number;

  /**
   * The maximum Momentary Loudness recorded since processing began.
   */
  maximumMomentaryLoudness: number;

  /**
   * The maximum Short-Term Loudness recorded since processing began.
   */
  maximumShortTermLoudness: number;

  /**
   * Maximum True Peak level, calculated using 4x oversampling to catch inter-sample peaks.
   */
  maximumTruePeakLevel: number;
};
