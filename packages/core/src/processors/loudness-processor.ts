import {
  ATTENUATION_DB,
  CHANNEL_WEIGHT_FACTORS,
  K_WEIGHTING_COEFFICIENTS,
  LOUDNESS_RANGE_LOWER_PERCENTILE,
  LOUDNESS_RANGE_UPPER_PERCENTILE,
  LRA_ABSOLUTE_THRESHOLD,
  LRA_RELATIVE_THRESHOLD_FACTOR,
  LUFS_ABSOLUTE_THRESHOLD,
  LUFS_RELATIVE_THRESHOLD_FACTOR,
  MOMENTARY_HOP_INTERVAL_SEC,
  MOMENTARY_WINDOW_SEC,
  SHORT_TERM_HOP_INTERVAL_SEC,
  SHORT_TERM_WINDOW_SEC,
  TRUE_PEAK_COEFFICIENTS,
} from "#constants";
import { BiquadraticFilter, FiniteImpulseResponseFilter } from "#filters";
import type {
  LoudnessMeasurements,
  LoudnessProcessorOptions,
  Repeat,
} from "#types";
import { CircularBuffer } from "#utils";

/**
 * Loudness Algorithm Implementation (ITU-R BS.1770-5)
 *
 * @class
 * @extends AudioWorkletProcessor
 */
class LoudnessProcessor extends AudioWorkletProcessor {
  capacity: number;
  interval: number;
  previousTime: number = 0;
  attenuation: number = 10 ** (-ATTENUATION_DB / 20);
  measurements: LoudnessMeasurements[];
  kWeightingFilters: Repeat<BiquadraticFilter, 2>[][] = [];
  overSamplingFilters: Repeat<FiniteImpulseResponseFilter, 4>[][] = [];
  overSampledValues: number[] = [];
  overSampledValueDirtyFlags: boolean[] = [];
  mEnergyBuffers: CircularBuffer<number>[] = [];
  mEnergySums: number[] = [];
  mSampleAccumulators: number[] = [];
  mTraces: Array<number>[] | CircularBuffer<number>[] = [];
  mTraceDirtyFlags: boolean[] = [];
  sEnergyBuffers: CircularBuffer<number>[] = [];
  sEnergySums: number[] = [];
  sSampleAccumulators: number[] = [];
  sTraces: Array<number>[] | CircularBuffer<number>[] = [];
  sTraceDirtyFlags: boolean[] = [];

  constructor(options: AudioWorkletNodeOptions) {
    super();

    const { numberOfInputs = 1, processorOptions } = options;
    const { capacity, interval } = processorOptions as LoudnessProcessorOptions;

    this.capacity = capacity || 0;
    this.interval = interval || 0;
    this.measurements = [];

    for (let i = 0; i < numberOfInputs; i++) {
      const mEnergyBufferSize = Math.round(sampleRate * MOMENTARY_WINDOW_SEC);
      const sEnergyBufferSize = Math.round(sampleRate * SHORT_TERM_WINDOW_SEC);
      const mTraceSize = Math.ceil(this.capacity / MOMENTARY_HOP_INTERVAL_SEC);
      const sTraceSize = Math.ceil(this.capacity / SHORT_TERM_HOP_INTERVAL_SEC);

      this.mEnergySums[i] = 0;
      this.mSampleAccumulators[i] = 0;
      this.mEnergyBuffers[i] = new CircularBuffer(mEnergyBufferSize);
      this.mTraces[i] = this.capacity ? new CircularBuffer(mTraceSize) : [];
      this.sEnergySums[i] = 0;
      this.sSampleAccumulators[i] = 0;
      this.sEnergyBuffers[i] = new CircularBuffer(sEnergyBufferSize);
      this.sTraces[i] = this.capacity ? new CircularBuffer(sTraceSize) : [];
      this.measurements[i] = {
        momentaryLoudness: Number.NEGATIVE_INFINITY,
        shortTermLoudness: Number.NEGATIVE_INFINITY,
        integratedLoudness: Number.NEGATIVE_INFINITY,
        maximumMomentaryLoudness: Number.NEGATIVE_INFINITY,
        maximumShortTermLoudness: Number.NEGATIVE_INFINITY,
        maximumTruePeakLevel: Number.NEGATIVE_INFINITY,
        loudnessRange: Number.NEGATIVE_INFINITY,
      };
    }
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>,
  ): boolean {
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].length) {
        continue;
      }

      const channelCount = inputs[i].length;
      const sampleCount = inputs[i][0].length;
      const phaseSize: number = sampleRate >= 96000 ? 2 : 4;
      const weights = CHANNEL_WEIGHT_FACTORS[channelCount];
      const mEnergyBufferCapacity = this.mEnergyBuffers[i].capacity;
      const sEnergyBufferCapacity = this.sEnergyBuffers[i].capacity;

      if (
        !this.kWeightingFilters[i] ||
        this.kWeightingFilters[i].length !== channelCount
      ) {
        const { highshelf, highpass } = K_WEIGHTING_COEFFICIENTS;

        this.kWeightingFilters[i] = this.kWeightingFilters[i] || [];

        for (let c = 0; c < channelCount; c++) {
          this.kWeightingFilters[i][c] = [
            new BiquadraticFilter(highshelf.a, highshelf.b),
            new BiquadraticFilter(highpass.a, highpass.b),
          ];
        }
      }

      if (
        !this.overSamplingFilters[i] ||
        this.overSamplingFilters[i].length !== channelCount
      ) {
        const { lowpass } = TRUE_PEAK_COEFFICIENTS;
        const { phase0, phase1, phase2, phase3 } = lowpass;

        this.overSamplingFilters[i] = this.overSamplingFilters[i] || [];

        for (let c = 0; c < channelCount; c++) {
          this.overSamplingFilters[i][c] = [
            new FiniteImpulseResponseFilter(phase0),
            new FiniteImpulseResponseFilter(phase1),
            new FiniteImpulseResponseFilter(phase2),
            new FiniteImpulseResponseFilter(phase3),
          ];
        }
      }

      for (let s = 0; s < sampleCount; s++) {
        let energy = 0;

        for (let c = 0; c < channelCount; c++) {
          const sample = inputs[i][c][s];
          const [highshelf, highpass] = this.kWeightingFilters[i][c];
          const highshelfOutput = highshelf.process(sample);
          const kWeightedSample = highpass.process(highshelfOutput);
          const sampleEnergy = kWeightedSample * kWeightedSample;
          const channelWeight = weights[c] ?? 1.0;

          energy += sampleEnergy * channelWeight;

          const attenuatedSample = sample * this.attenuation;
          let maxOverSampledValue = 0;

          for (let p = 0; p < phaseSize; p++) {
            const filter = this.overSamplingFilters[i][c][p];
            const absValue = Math.abs(filter.process(attenuatedSample));

            if (maxOverSampledValue < absValue) {
              maxOverSampledValue = absValue;
            }
          }

          if (this.overSampledValues[i] !== undefined) {
            if (maxOverSampledValue > this.overSampledValues[i]) {
              this.overSampledValues[i] = maxOverSampledValue;
              this.overSampledValueDirtyFlags[i] = true;
            }
          } else {
            this.overSampledValues[i] = maxOverSampledValue;
            this.overSampledValueDirtyFlags[i] = true;
          }
        }

        const mEnergyForSum = this.mEnergyBuffers[i].evict(energy) ?? 0;
        this.mEnergySums[i] += energy - mEnergyForSum;

        const sEnergyForSum = this.sEnergyBuffers[i].evict(energy) ?? 0;
        this.sEnergySums[i] += energy - sEnergyForSum;

        if (this.mEnergyBuffers[i].isFull()) {
          const meanEnergy = this.mEnergySums[i] / mEnergyBufferCapacity;
          const mCurrLoudness = this.energyToLoudness(meanEnergy);
          const mPrevLoudness = this.measurements[i].maximumMomentaryLoudness;
          const mLoudness = Math.max(mCurrLoudness, mPrevLoudness);

          this.measurements[i].momentaryLoudness = mCurrLoudness;
          this.measurements[i].maximumMomentaryLoudness = mLoudness;
        }
      }

      this.mSampleAccumulators[i] += sampleCount;
      this.sSampleAccumulators[i] += sampleCount;
      const mHopSize = Math.round(sampleRate * MOMENTARY_HOP_INTERVAL_SEC);
      const sHopSize = Math.round(sampleRate * SHORT_TERM_HOP_INTERVAL_SEC);

      while (this.mSampleAccumulators[i] >= mHopSize) {
        if (this.mEnergyBuffers[i].isFull()) {
          const meanEnergy = this.mEnergySums[i] / mEnergyBufferCapacity;
          const mLoudness = this.energyToLoudness(meanEnergy);

          this.mTraces[i].push(mLoudness);
          this.mTraceDirtyFlags[i] = true;
        }

        this.mSampleAccumulators[i] -= mHopSize;
      }

      while (this.sSampleAccumulators[i] >= sHopSize) {
        if (this.sEnergyBuffers[i].isFull()) {
          const meanEnergy = this.sEnergySums[i] / sEnergyBufferCapacity;
          const sCurrLoudness = this.energyToLoudness(meanEnergy);
          const sPrevLoudness = this.measurements[i].maximumShortTermLoudness;
          const sLoudness = Math.max(sCurrLoudness, sPrevLoudness);

          this.measurements[i].shortTermLoudness = sCurrLoudness;
          this.measurements[i].maximumShortTermLoudness = sLoudness;

          this.sTraces[i].push(sCurrLoudness);
          this.sTraceDirtyFlags[i] = true;
        }

        this.sSampleAccumulators[i] -= sHopSize;
      }

      if (this.mTraces[i].length > 2 && this.mTraceDirtyFlags[i]) {
        const absGatedLoudnesses = [];

        for (const trace of this.mTraces[i]) {
          if (trace > LUFS_ABSOLUTE_THRESHOLD) {
            absGatedLoudnesses.push(trace);
          }
        }

        if (absGatedLoudnesses.length > 2) {
          const absGatedEnergies = [];

          for (const loudness of absGatedLoudnesses) {
            absGatedEnergies.push(this.loudnessToEnergy(loudness));
          }

          let absGatedEnergySum = 0;

          for (const energy of absGatedEnergies) {
            absGatedEnergySum += energy;
          }

          const absGatedEnergy = absGatedEnergySum / absGatedEnergies.length;
          const absGatedLoudness = this.energyToLoudness(absGatedEnergy);
          const threshold = absGatedLoudness + LUFS_RELATIVE_THRESHOLD_FACTOR;

          const relGatedLoudnesses = [];

          for (const loudness of absGatedLoudnesses) {
            if (loudness > threshold) {
              relGatedLoudnesses.push(loudness);
            }
          }

          if (relGatedLoudnesses.length > 2) {
            const relGatedEnergies = [];

            for (const loudness of relGatedLoudnesses) {
              relGatedEnergies.push(this.loudnessToEnergy(loudness));
            }

            let relGatedEnergySum = 0;

            for (const energy of relGatedEnergies) {
              relGatedEnergySum += energy;
            }

            const relGatedEnergy = relGatedEnergySum / relGatedEnergies.length;
            const iLoudness = this.energyToLoudness(relGatedEnergy);

            this.measurements[i].integratedLoudness = iLoudness;
          }
        }

        this.mTraceDirtyFlags[i] = false;
      }

      if (this.sTraces[i].length > 2 && this.sTraceDirtyFlags[i]) {
        const absGatedLoudnesses = [];

        for (const trace of this.sTraces[i]) {
          if (trace > LRA_ABSOLUTE_THRESHOLD) {
            absGatedLoudnesses.push(trace);
          }
        }

        if (absGatedLoudnesses.length > 2) {
          const absGatedEnergies = [];

          for (const loudness of absGatedLoudnesses) {
            absGatedEnergies.push(this.loudnessToEnergy(loudness));
          }

          let absGatedEnergySum = 0;

          for (const energy of absGatedEnergies) {
            absGatedEnergySum += energy;
          }

          const absGatedEnergy = absGatedEnergySum / absGatedEnergies.length;
          const absGatedLoudness = this.energyToLoudness(absGatedEnergy);
          const threshold = absGatedLoudness + LRA_RELATIVE_THRESHOLD_FACTOR;

          const relGatedLoudnesses = [];

          for (const loudness of absGatedLoudnesses) {
            if (loudness > threshold) {
              relGatedLoudnesses.push(loudness);
            }
          }

          if (relGatedLoudnesses.length > 2) {
            const sortedLoudnesses = relGatedLoudnesses.sort((a, b) => a - b);
            const [lowerPercentile, upperPercentile] = [
              LOUDNESS_RANGE_LOWER_PERCENTILE,
              LOUDNESS_RANGE_UPPER_PERCENTILE,
            ].map((percentile) => {
              const lowerIndex = Math.floor(
                percentile * (sortedLoudnesses.length - 1),
              );
              const upperIndex = Math.ceil(
                percentile * (sortedLoudnesses.length - 1),
              );

              if (upperIndex === lowerIndex) {
                return sortedLoudnesses[lowerIndex];
              }

              return (
                sortedLoudnesses[lowerIndex] +
                (sortedLoudnesses[upperIndex] - sortedLoudnesses[lowerIndex]) *
                  (percentile * (sortedLoudnesses.length - 1) - lowerIndex)
              );
            });

            const loudnessRange = upperPercentile - lowerPercentile;

            this.measurements[i].loudnessRange = loudnessRange;
          }
        }

        this.sTraceDirtyFlags[i] = false;
      }
    }

    if (currentTime - this.previousTime >= Number(this.interval)) {
      for (let i = 0; i < this.measurements.length; i++) {
        const overSampledValue = this.overSampledValues[i];
        const overSampledValueDirtyFlag = this.overSampledValueDirtyFlags[i];

        if (overSampledValueDirtyFlag) {
          const truePeak = 20 * Math.log10(overSampledValue) + ATTENUATION_DB;
          this.measurements[i].maximumTruePeakLevel = truePeak;
          this.overSampledValueDirtyFlags[i] = false;
        }
      }

      const snapshot = {
        currentFrame,
        currentTime,
        currentMeasurements: this.measurements,
      };

      this.port.postMessage(snapshot);
      this.previousTime = currentTime;
    }

    for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
      for (let j = 0; j < Math.min(inputs[i].length, outputs[i].length); j++) {
        outputs[i][j].set(inputs[i][j]);
      }
    }

    return true;
  }

  energyToLoudness(energy: number): number {
    return -0.691 + 10 * Math.log10(Math.max(energy, Number.EPSILON));
  }

  loudnessToEnergy(loudness: number): number {
    return 10 ** ((loudness + 0.691) / 10);
  }
}

export { LoudnessProcessor };
