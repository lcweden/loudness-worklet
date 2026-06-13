import { REGISTERED_NAME, INDEX } from "#common/constants";
import type { LoudnessOptions, LoudnessSnapshot } from "#common/types";

/**
 * LoudnessNode is an AudioWorkletNode that provides real-time loudness measurement.
 *
 * @class LoudnessNode
 * @extends {AudioWorkletNode} Web Audio API's AudioWorkletNode
 */
class LoudnessNode extends AudioWorkletNode {
  #views: Float32Array[];

  /**
   * @example
   *   const context = new AudioContext();
   *   const loudness = new LoudnessNode(context);
   *   const array = new Float32Array(loudness.metricCount);
   *
   *   loudness.getFloatLoudnessData(array);
   *
   *   const snapshot = LoudnessNode.from(array);
   *
   * @param {Float32Array} array - A Float32Array containing loudness metrics from the audio
   *   processor.
   * @returns {LoudnessSnapshot} A snapshot of the current loudness metrics.
   */
  static from(array: Float32Array): LoudnessSnapshot {
    return {
      currentFrame: array[INDEX.CURRENT_FRAME],
      currentTime: array[INDEX.CURRENT_TIME],
      loudnessRange: array[INDEX.LOUDNESS_RANGE],
      momentaryLoudness: array[INDEX.MOMENTARY],
      shortTermLoudness: array[INDEX.SHORT_TERM],
      integratedLoudness: array[INDEX.INTEGRATED],
      maximumMomentaryLoudness: array[INDEX.MAX_MOMENTARY],
      maximumShortTermLoudness: array[INDEX.MAX_SHORT_TERM],
      maximumTruePeakLevel: array[INDEX.TRUE_PEAK],
    };
  }

  /**
   * @example
   *   const context = new AudioContext();
   *   const loudness = new LoudnessNode(context, { numberOfInputs: 2 });
   *
   * @param {BaseAudioContext} context - The audio context to associate with this node.
   * @param {LoudnessOptions} options - Configuration options for the LoudnessNode.
   */
  constructor(context: BaseAudioContext, options: LoudnessOptions = {}) {
    const { numberOfInputs = 1 } = options;
    const shared = globalThis.crossOriginIsolated;
    const iterable = { length: numberOfInputs };
    const size = Object.keys(INDEX).length * Float32Array.BYTES_PER_ELEMENT;
    const buffers = shared ? Array.from(iterable, () => new SharedArrayBuffer(size)) : undefined;
    const processorOptions = { shared, buffers };
    const audioWorkletNodeOptions = { numberOfInputs, processorOptions };

    super(context, REGISTERED_NAME, audioWorkletNodeOptions);

    if (shared && buffers) {
      this.#views = buffers.map((buffer) => new Float32Array(buffer));
    } else {
      this.#views = Array.from(iterable, () => new Float32Array(Object.keys(INDEX).length));
      this.port.onmessage = (event: MessageEvent<Float32Array[]>) => {
        for (let i = 0; i < event.data.length; i++) {
          this.#views[i].set(event.data[i]);
        }
      };
    }
  }

  /**
   * The number of loudness metrics available in LoudnessNode.
   *
   * @example
   *   const context = new AudioContext();
   *   const loudness = new LoudnessNode(context);
   *   console.log(loudness.metricCount); // Outputs the number of loudness metrics
   *
   * @returns {number} The number of loudness metrics available.
   */
  get metricCount(): number {
    return Object.keys(INDEX).length;
  }

  /**
   * Copies the loudness metrics from the specified index of inputs into the provided array.
   *
   * @example
   *   const context = new AudioContext();
   *   const loudness = new LoudnessNode(context);
   *   const array = new Float32Array(loudness.metricCount);
   *
   *   loudness.getFloatLoudnessData(array);
   *
   *   // `array` now contains the loudness metrics for the first input
   *
   * @param array The array to copy the loudness metrics into.
   * @param index The index of the input to copy the loudness metrics from.
   */
  getFloatLoudnessData(array: Float32Array, index: number = 0): void {
    if (index < 0 || index >= this.#views.length) {
      throw new RangeError(`Index ${index} is out of bounds`);
    }

    array.set(this.#views[index]);
  }
}

export default LoudnessNode;
