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

export type ValidationRule = {
  time: number;
  metric: keyof LoudnessSnapshot;
  expected: number;
  tolerances: [number] | [number, number];
};

export type ValidationResult = {
  rule: ValidationRule;
  actual?: number;
  passed: boolean;
};
