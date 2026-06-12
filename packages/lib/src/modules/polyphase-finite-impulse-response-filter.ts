/**
 * A polyphase finite impulse response filter implementation.
 *
 * @class PolyphaseFiniteImpulseResponseFilter
 */
class PolyphaseFiniteImpulseResponseFilter {
  #coefficients: Float32Array[];
  #history: Float32Array;
  #numberOfTaps: number;
  #numberOfPhases: number;
  #pointer: number;

  /**
   * Creates a new PolyphaseFiniteImpulseResponseFilter with given coefficients.
   *
   * @param {number} numberOfTaps The number of taps in each phase
   * @param {number[][]} coefficients An array of coefficient arrays, one for each phase
   */
  constructor(numberOfTaps: number, coefficients: number[][]) {
    this.#coefficients = coefficients.map((phase) => new Float32Array(phase));
    this.#history = new Float32Array(numberOfTaps);
    this.#numberOfTaps = numberOfTaps;
    this.#numberOfPhases = coefficients.length;
    this.#pointer = 0;
  }

  /**
   * Processes the input signal and produces the output signal.
   *
   * @param {Float32Array} input The input signal
   * @param {Float32Array} output The output signal
   */
  process(input: Float32Array, output: Float32Array): void {
    const history = this.#history;
    const coefficients = this.#coefficients;
    const taps = this.#numberOfTaps;
    const phases = this.#numberOfPhases;
    let pointer = this.#pointer;

    for (let i = 0; i < input.length; i++) {
      history[pointer] = input[i];

      for (let p = 0; p < phases; p++) {
        const phase = coefficients[p];
        let sum = 0;

        for (let c = 0; c < taps; c++) {
          let index = pointer - c;

          if (index < 0) {
            index += taps;
          }

          sum += phase[c] * history[index];
        }

        output[i * phases + p] = sum;
      }

      pointer++;

      if (pointer >= taps) {
        pointer = 0;
      }
    }

    this.#pointer = pointer;
  }
}

export default PolyphaseFiniteImpulseResponseFilter;
