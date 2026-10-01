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

/**
 * A validation rule to check a specific loudness metric against an expected value at a given time.
 */
export type ValidationRule = {
  /**
   * The timestamp in seconds at which the metric should be evaluated.
   */
  time: number;

  /**
   * The loudness metric to inspect from the snapshot.
   */
  metric: keyof LoudnessSnapshot;

  /**
   * The expected value for the specified metric.
   */
  expected: number;

  /**
   * Allowed tolerances. Single value for symmetric tolerance `[tol]`, or `[lower, upper]` for
   * asymmetric tolerance.
   */
  tolerances: [number] | [number, number];
};

/**
 * The outcome of evaluating a validation rule against actual loudness snapshots.
 */
export type ValidationResult = {
  /**
   * The validation rule that was tested.
   */
  rule: ValidationRule;

  /**
   * The actual value obtained from the snapshot, or undefined if no snapshot matched.
   */
  actual?: number;

  /**
   * Whether the actual value falls within the expected tolerance range.
   */
  passed: boolean;
};
