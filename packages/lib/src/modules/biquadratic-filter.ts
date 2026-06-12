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

  process(buffer: Float32Array): void {
    let x1 = this.#x1;
    let x2 = this.#x2;
    let y1 = this.#y1;
    let y2 = this.#y2;

    const b0 = this.#b0;
    const b1 = this.#b1;
    const b2 = this.#b2;
    const a1 = this.#a1;
    const a2 = this.#a2;

    for (let i = 0; i < buffer.length; i++) {
      const input = buffer[i];
      const output = b0 * input + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

      x2 = x1;
      x1 = input;
      y2 = y1;
      y1 = output;

      buffer[i] = output;
    }

    this.#x1 = x1;
    this.#x2 = x2;
    this.#y1 = y1;
    this.#y2 = y2;
  }
}

export default BiquadraticFilter;
