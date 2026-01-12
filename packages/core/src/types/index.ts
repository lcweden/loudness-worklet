type Repeat<
  T,
  C extends number,
  Result extends unknown[] = [],
> = Result["length"] extends C ? Result : Repeat<T, C, [...Result, T]>;

type LoudnessMeasurements = {
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
  currentMeasurements: LoudnessMeasurements[];
};

export type { LoudnessSnapshot, LoudnessMeasurements, Repeat };
