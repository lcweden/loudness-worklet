import {
  CHANNEL_WEIGHT_FACTORS,
  INDEX,
  MAX_LUFS,
  MIN_LUFS,
  REGISTERED_NAME,
  RESOLUTION,
  MOMENTARY_WINDOW_SEC,
  SHORT_TERM_WINDOW_SEC,
  LUFS_ABSOLUTE_THRESHOLD,
  LUFS_RELATIVE_THRESHOLD,
  LRA_RELATIVE_THRESHOLD,
  LRA_ABSOLUTE_THRESHOLD,
  LOUDNESS_RANGE_UPPER_PERCENTILE,
  LOUDNESS_RANGE_LOWER_PERCENTILE,
  HOP_INTERVAL_SEC,
  TRUE_PEAK_COEFFICIENTS,
  ATTENUATION_DB,
} from "#common/constants";
import type { LoudnessWorkletOptions } from "#common/types";
import BiquadraticFilter from "#modules/biquadratic-filter";
import CircularBuffer from "#modules/circular-buffer";
import FiniteImpulseResponseFilter from "#modules/finite-impulse-response-filter";
import Histogram from "#modules/histogram";
import { computeKWeightingCoefficients } from "#utils/k-weighting";
import { energyToLoudness, loudnessToEnergy } from "#utils/loudness";

class LoudnessProcessor extends AudioWorkletProcessor {
  shared: boolean;
  views: Float32Array[];
  samples: Float32Array;
  upsamples: Float32Array;
  kWeightingFilters: BiquadraticFilter[][][];
  truePeakFilters: FiniteImpulseResponseFilter[][];
  momentaryBuffers: CircularBuffer[];
  shortTermBuffers: CircularBuffer[];
  momentaryHistograms: Histogram[];
  shortTermHistograms: Histogram[];
  hopSize: number;
  previousTime: number;
  counter: number;

  constructor(options: LoudnessWorkletOptions) {
    const { numberOfInputs = 1, processorOptions } = options;
    const { shared, buffers } = processorOptions;

    super();

    this.shared = shared;
    this.samples = new Float32Array(128);
    this.upsamples = new Float32Array(128 * 4);
    this.views = [];
    this.kWeightingFilters = [];
    this.truePeakFilters = [];
    this.momentaryBuffers = [];
    this.shortTermBuffers = [];
    this.momentaryHistograms = [];
    this.shortTermHistograms = [];
    this.hopSize = Math.round(sampleRate * HOP_INTERVAL_SEC);
    this.previousTime = 0;
    this.counter = 0;

    const capacity = (window: number) => Math.max(1, Math.floor(window / (128 / sampleRate)));

    for (let i = 0; i < numberOfInputs; i++) {
      this.kWeightingFilters[i] = [];
      this.truePeakFilters[i] = [];
      this.momentaryBuffers[i] = new CircularBuffer(capacity(MOMENTARY_WINDOW_SEC));
      this.shortTermBuffers[i] = new CircularBuffer(capacity(SHORT_TERM_WINDOW_SEC));
      this.momentaryHistograms[i] = new Histogram(MIN_LUFS, MAX_LUFS, RESOLUTION);
      this.shortTermHistograms[i] = new Histogram(MIN_LUFS, MAX_LUFS, RESOLUTION);

      if (buffers && buffers[i]) {
        this.views[i] = new Float32Array(buffers[i]).fill(Number.NEGATIVE_INFINITY);
      } else {
        this.views[i] = new Float32Array(Object.keys(INDEX).length).fill(Number.NEGATIVE_INFINITY);
      }
    }
  }

  process(inputs: Float32Array[][], _outputs: Float32Array[][]) {
    const numberOfInputs = inputs.length;
    const attenduation = 10 ** (-ATTENUATION_DB / 20);

    for (let i = 0; i < numberOfInputs; i++) {
      const numberOfChannels = inputs[i].length;
      const numberOfSamples = inputs[i][0].length;

      if (!inputs[i] || numberOfChannels === 0) {
        continue;
      }

      if (this.samples.length < numberOfSamples) {
        this.samples = new Float32Array(numberOfSamples);
        this.upsamples = new Float32Array(numberOfSamples * 4);
      }

      if (this.kWeightingFilters[i].length < numberOfChannels) {
        for (let c = this.kWeightingFilters[i].length; c < numberOfChannels; c++) {
          const { highshelf, highpass } = computeKWeightingCoefficients(sampleRate);
          const filter1 = new BiquadraticFilter(highshelf.a, highshelf.b);
          const filter2 = new BiquadraticFilter(highpass.a, highpass.b);

          this.kWeightingFilters[i].push([filter1, filter2]);
        }
      }

      if (this.truePeakFilters[i].length < numberOfChannels) {
        for (let c = this.truePeakFilters[i].length; c < numberOfChannels; c++) {
          const filter = new FiniteImpulseResponseFilter(12, [
            TRUE_PEAK_COEFFICIENTS.lowpass.phase0,
            TRUE_PEAK_COEFFICIENTS.lowpass.phase1,
            TRUE_PEAK_COEFFICIENTS.lowpass.phase2,
            TRUE_PEAK_COEFFICIENTS.lowpass.phase3,
          ]);

          this.truePeakFilters[i].push(filter);
        }
      }

      const weights = CHANNEL_WEIGHT_FACTORS[numberOfChannels] || CHANNEL_WEIGHT_FACTORS[1];
      let energy = 0;
      let linear = 0;

      for (let j = 0; j < numberOfChannels; j++) {
        const [highshelf, highpass] = this.kWeightingFilters[i][j];
        let sumOfSquares = 0;

        this.samples.set(inputs[i][j]);

        highshelf.process(this.samples);
        highpass.process(this.samples);

        for (let k = 0; k < numberOfSamples; k++) {
          const sample = this.samples[k];

          sumOfSquares += sample * sample;

          this.samples[k] = inputs[i][j][k] * attenduation;
        }

        const meanSquare = sumOfSquares / numberOfSamples;
        const weight = weights[j] ?? 1.0;

        energy += meanSquare * weight;

        const upsampler = this.truePeakFilters[i][j];

        upsampler.process(this.samples, this.upsamples);

        for (let k = 0; k < this.upsamples.length; k++) {
          const absolute = Math.abs(this.upsamples[k]);

          if (absolute > linear) {
            linear = absolute;
          }
        }
      }

      const truePeak = 20 * Math.log10(linear) + ATTENUATION_DB;
      const momentaryBuffer = this.momentaryBuffers[i];
      const shortTermBuffer = this.shortTermBuffers[i];
      const momentaryHistogram = this.momentaryHistograms[i];
      const shortTermHistogram = this.shortTermHistograms[i];

      momentaryBuffer.push(energy);
      shortTermBuffer.push(energy);

      const momentaryEnergy = momentaryBuffer.sum() / momentaryBuffer.length;
      const shortTermEnergy = shortTermBuffer.sum() / shortTermBuffer.length;
      const momentaryLoudness = energyToLoudness(momentaryEnergy);
      const shortTermLoudness = energyToLoudness(shortTermEnergy);

      this.counter += numberOfSamples;

      if (this.counter >= this.hopSize) {
        this.counter -= this.hopSize;

        momentaryHistogram.add(momentaryLoudness);
        shortTermHistogram.add(shortTermLoudness);
      }

      let integratedLoudness = MIN_LUFS;
      let loudnessRange = 0;

      if (momentaryHistogram.size > 0) {
        let absoluteGatedEnergySum = 0;
        let absoluteGatedCount = 0;

        for (let i = 0; i < momentaryHistogram.size; i++) {
          const count = momentaryHistogram.bins[i];

          if (count === 0) {
            continue;
          }

          const loudness = MIN_LUFS + i * RESOLUTION;

          if (loudness > LUFS_ABSOLUTE_THRESHOLD) {
            const energy = loudnessToEnergy(loudness);

            absoluteGatedEnergySum += energy * count;
            absoluteGatedCount += count;
          }
        }

        if (absoluteGatedCount > 0) {
          const absoluteMeanEnergy = absoluteGatedEnergySum / absoluteGatedCount;
          const absoluteGatedLoudness = energyToLoudness(absoluteMeanEnergy);
          const threshold = absoluteGatedLoudness + LUFS_RELATIVE_THRESHOLD;
          let relativeGatedEnergySum = 0;
          let relativeGatedCount = 0;

          for (let i = 0; i < momentaryHistogram.size; i++) {
            const count = momentaryHistogram.bins[i];

            if (count === 0) {
              continue;
            }

            const loudness = MIN_LUFS + i * RESOLUTION;

            if (loudness > LUFS_ABSOLUTE_THRESHOLD && loudness > threshold) {
              const energy = loudnessToEnergy(loudness);

              relativeGatedEnergySum += energy * count;
              relativeGatedCount += count;
            }
          }

          if (relativeGatedCount > 0) {
            const relativeMeanEnergy = relativeGatedEnergySum / relativeGatedCount;

            integratedLoudness = energyToLoudness(relativeMeanEnergy);
          }
        }
      }

      if (shortTermHistogram.size > 0) {
        let absoluteGatedEnergySum = 0;
        let absoluteGatedCount = 0;

        for (let i = 0; i < shortTermHistogram.size; i++) {
          const count = shortTermHistogram.bins[i];

          if (count === 0) {
            continue;
          }

          const loudness = MIN_LUFS + i * RESOLUTION;

          if (loudness > LRA_ABSOLUTE_THRESHOLD) {
            const energy = loudnessToEnergy(loudness);

            absoluteGatedEnergySum += energy * count;
            absoluteGatedCount += count;
          }
        }

        if (absoluteGatedCount > 0) {
          const absoluteMeanEnergy = absoluteGatedEnergySum / absoluteGatedCount;
          const absoluteGatedLoudness = energyToLoudness(absoluteMeanEnergy);
          const threshold = absoluteGatedLoudness + LRA_RELATIVE_THRESHOLD;
          // const p95 = shortTermHistogram.percentile(LOUDNESS_RANGE_UPPER_PERCENTILE, threshold);
          // const p10 = shortTermHistogram.percentile(LOUDNESS_RANGE_LOWER_PERCENTILE, threshold);

          const { min, step, size } = shortTermHistogram;

          const start = Math.max(0, Math.round((threshold - min) / step));
          let count = 0;

          for (let i = start; i < size; i++) {
            count += shortTermHistogram.bins[i];
          }

          if (count > 0) {
            const target95 = Math.round(count * LOUDNESS_RANGE_UPPER_PERCENTILE);
            const target10 = Math.round(count * LOUDNESS_RANGE_LOWER_PERCENTILE);

            let p10 = min;
            let p95 = min;
            let cumulative = 0;
            let found10 = false;

            for (let i = start; i < size; i++) {
              cumulative += shortTermHistogram.bins[i];

              if (!found10 && cumulative >= target10) {
                p10 = min + i * step;
                found10 = true;
              }

              if (cumulative >= target95) {
                p95 = min + i * step;
                break;
              }
            }

            if (cumulative < target95) {
              p95 = min + (size - 1) * step;
            }

            loudnessRange = Math.max(0, p95 - p10);
          }
        }
      }

      const view = this.views[i];

      view[INDEX.CURRENT_TIME] = currentTime;
      view[INDEX.CURRENT_FRAME] = currentFrame;
      view[INDEX.MOMENTARY] = momentaryLoudness;
      view[INDEX.SHORT_TERM] = shortTermLoudness;
      view[INDEX.INTEGRATED] = integratedLoudness;
      view[INDEX.MAX_MOMENTARY] = Math.max(view[INDEX.MAX_MOMENTARY], momentaryLoudness);
      view[INDEX.MAX_SHORT_TERM] = Math.max(view[INDEX.MAX_SHORT_TERM], shortTermLoudness);
      view[INDEX.LOUDNESS_RANGE] = loudnessRange;
      view[INDEX.TRUE_PEAK] = Math.max(view[INDEX.TRUE_PEAK], truePeak);
    }

    if (!this.shared) {
      if (currentTime - this.previousTime >= RESOLUTION) {
        const copies = this.views.map((view) => new Float32Array(view));

        this.port.postMessage(copies);
        this.previousTime = currentTime;
      }
    }

    return true;
  }
}

registerProcessor(REGISTERED_NAME, LoudnessProcessor);
