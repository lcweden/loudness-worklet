class CircularBuffer {
  #bytes: Float32Array;
  #capacity: number;
  #head: number;
  #length: number;

  constructor(capacity: number) {
    this.#capacity = Math.max(1, Math.floor(capacity));
    this.#bytes = new Float32Array(this.#capacity);
    this.#head = 0;
    this.#length = 0;
  }

  get length(): number {
    return this.#length;
  }

  get capacity(): number {
    return this.#capacity;
  }

  get full(): boolean {
    return this.length === this.capacity;
  }

  push(item: number): void {
    this.#bytes[this.#head] = item;
    this.#head = (this.#head + 1) % this.#capacity;

    if (this.#length < this.#capacity) {
      this.#length++;
    }
  }

  sum(): number {
    const length = this.#length;
    const buffer = this.#bytes;
    let total = 0;

    for (let i = 0; i < length; i++) {
      total += buffer[i];
    }

    return total;
  }

  reset(): void {
    this.#head = 0;
    this.#length = 0;
  }
}

export default CircularBuffer;
