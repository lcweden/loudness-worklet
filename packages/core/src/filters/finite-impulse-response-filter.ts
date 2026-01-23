/**
 * Implements a simple finite impulse response filter.
 */
class FiniteImpulseResponseFilter {
  #coefficients: number[];
  #buffer: number[];
  #index: number;

  /**
   * Creates an instance of the filter.
   * @param coefficients - The filter coefficients.
   */
  constructor(coefficients: number[]) {
    this.#coefficients = coefficients;
    this.#buffer = Array(coefficients.length).fill(0);
    this.#index = 0;
  }

  /**
   * Processes a single input sample.
   * @param {number} input - The input sample.
   * @returns {number} - The filtered output sample.
   */
  process(input: number): number {
    this.#buffer[this.#index] = input;
    this.#index = (this.#index + 1) % this.#buffer.length;

    let output = 0;

    for (let i = 0; i < this.#coefficients.length; i++) {
      const index =
        (this.#index - 1 - i + this.#buffer.length) % this.#buffer.length;
      output += this.#coefficients[i] * this.#buffer[index];
    }

    return output;
  }

  /**
   * Resets the filter state.
   * @returns { void }
   */
  reset(): void {
    this.#buffer.fill(0);
    this.#index = 0;
  }
}

export { FiniteImpulseResponseFilter };
