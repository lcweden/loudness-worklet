import { REGISTERED_NAME, INDEX } from "#common/constants";
import type { LoudnessOptions, LoudnessSnapshot } from "#common/types";

class LoudnessNode extends AudioWorkletNode {
  #views: Float32Array[];

  static from(array: Float32Array): LoudnessSnapshot {
    return {
      currentFrame: array[INDEX.CURRENT_FRAME],
      currentTime: array[INDEX.CURRENT_TIME],
      momentaryLoudness: array[INDEX.MOMENTARY],
      shortTermLoudness: array[INDEX.SHORT_TERM],
      integratedLoudness: array[INDEX.INTEGRATED],
      maximumMomentaryLoudness: array[INDEX.MAX_MOMENTARY],
      maximumShortTermLoudness: array[INDEX.MAX_SHORT_TERM],
      truePeak: array[INDEX.TRUE_PEAK],
      loudnessRange: array[INDEX.LOUDNESS_RANGE],
    };
  }

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

  get metricCount(): number {
    return Object.keys(INDEX).length;
  }

  getFloatLoudnessData(array: Float32Array, index: number = 0): void {
    if (index < 0 || index >= this.#views.length) {
      throw new RangeError(`Index ${index} is out of bounds`);
    }

    array.set(this.#views[index]);
  }
}

export default LoudnessNode;
