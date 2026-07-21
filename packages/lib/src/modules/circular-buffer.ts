/**
 * A circular buffer implementation for storing numbers.
 *
 * @class CircularBuffer
 */
class CircularBuffer {
  #bytes: Float32Array;
  #capacity: number;
  #head: number;
  #length: number;

  /**
   * Creates a new CircularBuffer with the specified capacity.
   *
   * @param {number} capacity The maximum number of items the buffer can hold.
   */
  constructor(capacity: number) {
    this.#capacity = Math.max(1, Math.floor(capacity));
    this.#bytes = new Float32Array(this.#capacity);
    this.#head = 0;
    this.#length = 0;
  }

  /**
   * Checks if the buffer is full.
   *
   * @returns {boolean} True if the buffer is full, false otherwise
   */
  get full(): boolean {
    return this.#length === this.#capacity;
  }

  /**
   * Gets the current number of items in the buffer.
   *
   * @returns {number} The number of items in the buffer
   */
  get length(): number {
    return this.#length;
  }

  /**
   * Adds a new item to the buffer, overwriting the oldest item if the buffer is full.
   *
   * @param {number} item The item to add to the buffer.
   */
  push(item: number): void {
    this.#bytes[this.#head] = item;
    this.#head = (this.#head + 1) % this.#capacity;

    if (this.#length < this.#capacity) {
      this.#length++;
    }
  }

  /**
   * Calculates the sum of all items currently in the buffer.
   *
   * @returns {number} The sum of the items in the buffer
   */
  sum(): number {
    const length = this.#length;
    const buffer = this.#bytes;
    let total = 0;

    for (let i = 0; i < length; i++) {
      total += buffer[i];
    }

    return total;
  }
}

export default CircularBuffer;
