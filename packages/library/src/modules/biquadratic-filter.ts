/**
 * A Biquadratic IIR Filter implementation.
 *
 * @class BiquadraticFilter
 */
class BiquadraticFilter {
  #a1: number;
  #a2: number;
  #b0: number;
  #b1: number;
  #b2: number;
  #x1: number;
  #x2: number;
  #y1: number;
  #y2: number;

  /**
   * Creates a new BiquadraticFilter with given coefficients.
   *
   * @param {number[]} a Feedback coefficients [a1, a2]
   * @param {number[]} b Feedforward coefficients [b0, b1, b2]
   */
  constructor(a: number[], b: number[]) {
    this.#a1 = a[0];
    this.#a2 = a[1];
    this.#b0 = b[0];
    this.#b1 = b[1];
    this.#b2 = b[2];
    this.#x1 = 0;
    this.#x2 = 0;
    this.#y1 = 0;
    this.#y2 = 0;
  }

  /**
   * Processes a block of audio samples synchronously. This method modifies the provided buffer
   * in-place to optimize memory allocation and performance.
   *
   * @param {Float32Array} input The input signal.
   */
  process(input: Float32Array): void {
    let x1 = this.#x1;
    let x2 = this.#x2;
    let y1 = this.#y1;
    let y2 = this.#y2;

    const b0 = this.#b0;
    const b1 = this.#b1;
    const b2 = this.#b2;
    const a1 = this.#a1;
    const a2 = this.#a2;

    for (let i = 0; i < input.length; i++) {
      const sample = input[i];
      const output = b0 * sample + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

      // Shift the delay line for the next iteration
      x2 = x1;
      x1 = sample;
      y2 = y1;
      y1 = output;

      // Writing the output back to the input buffer for in-place processing
      input[i] = output;
    }

    this.#x1 = x1;
    this.#x2 = x2;
    this.#y1 = y1;
    this.#y2 = y2;
  }
}

export default BiquadraticFilter;
