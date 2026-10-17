/**
 * Options for initializing the LoudnessProcessor inside the AudioWorklet thread.
 */
export interface LoudnessWorkletOptions extends AudioWorkletNodeOptions {
  processorOptions: {
    /**
     * Pre-allocated SharedArrayBuffers for each input channel.
     */
    buffers?: SharedArrayBuffer[];

    /**
     * Interval, in seconds, between loudness update messages sent from the AudioWorklet.
     */
    interval: number;

    /**
     * Indicates whether cross-origin isolation is active, allowing the use of SharedArrayBuffer for
     * zero-allocation, lock-free cross-thread communication.
     */
    shared: boolean;
  };
}

/**
 * Options for creating a LoudnessNode on the main thread.
 */
export interface LoudnessOptions extends AudioNodeOptions {
  /**
   * Interval, in seconds, between loudness update messages sent from the AudioWorklet.
   *
   * @default 0.1
   */
  interval?: number;

  /**
   * The number of independent audio inputs to analyze concurrently.
   *
   * @default 1
   */
  numberOfInputs?: number;
}
