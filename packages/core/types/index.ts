type Repeat<
  T,
  C extends number,
  Result extends unknown[] = [],
> = Result["length"] extends C ? Result : Repeat<T, C, [...Result, T]>;

type LoudnessMetrics = {
  momentaryLoudness: number;
  shortTermLoudness: number;
  integratedLoudness: number;
  maximumMomentaryLoudness: number;
  maximumShortTermLoudness: number;
  maximumTruePeakLevel: number;
  loudnessRange: number;
};

type LoudnessSnapshot = {
  currentFrame: number;
  currentTime: number;
  currentMetrics: LoudnessMetrics[];
};

export type { LoudnessSnapshot, LoudnessMetrics, Repeat };
