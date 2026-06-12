/**
 * A histogram data structure for collecting and binning numerical values.
 *
 * @class Histogram
 */
class Histogram {
  #min: number;
  #step: number;
  #bins: Uint32Array;

  /**
   * Creates a new Histogram instance.
   *
   * @param {number} min The minimum value of the histogram range
   * @param {number} max The maximum value of the histogram range
   * @param {number} step The width of each bin
   * @throws {RangeError} If min is greater than or equal to max
   * @throws {RangeError} If step is not strictly positive
   */
  constructor(min: number, max: number, step: number) {
    if (min >= max) {
      throw new RangeError("Unexpected min larger than or equal to max values");
    }

    if (step <= 0) {
      throw new RangeError("Step must be strictly positive");
    }

    this.#min = min;
    this.#step = step;
    this.#bins = new Uint32Array(Math.ceil((max - min) / step));
  }

  /**
   * Gets the bins array.
   *
   * @returns {Uint32Array} The array of bin counts
   */
  get bins(): Uint32Array {
    return this.#bins;
  }

  /**
   * Gets the minimum value of the histogram range.
   *
   * @returns {number} The minimum value
   */
  get min(): number {
    return this.#min;
  }

  /**
   * Gets the bin width.
   *
   * @returns {number} The step value
   */
  get step(): number {
    return this.#step;
  }

  /**
   * Gets the number of bins.
   *
   * @returns {number} The number of bins
   */
  get size(): number {
    return this.#bins.length;
  }

  /**
   * Adds a value to the histogram by incrementing the appropriate bin.
   *
   * @param {number} value The value to add to the histogram
   */
  add(value: number): void {
    if (value < this.#min) {
      return;
    }

    this.#bins[Math.floor((value - this.#min) / this.#step)]++;
  }
}

export default Histogram;
