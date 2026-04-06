/**
 * Implements a simple biquadratic filter.
 */
class BiquadraticFilter {
  #a: Float32Array = new Float32Array(2);
  #b: Float32Array = new Float32Array(3);
  #x: Float32Array = new Float32Array(2);
  #y: Float32Array = new Float32Array(2);

  /**
   * Creates a new BiquadraticFilter with given coefficients.
   * @param { number[] } a - Feedback coefficients [a1, a2]
   * @param { number[] } b - Feedforward coefficients [b0, b1, b2]
   */
  constructor(a: number[], b: number[]) {
    this.reset();
    this.set(a, b);
  }

  /**
   * Processes a single input sample and returns the filtered output.
   * @param { number } input - The input sample.
   * @returns { number } - The filtered output sample.
   */
  process(input: number): number {
    const output =
      this.#b[0] * input +
      this.#b[1] * this.#x[0] +
      this.#b[2] * this.#x[1] -
      this.#a[0] * this.#y[0] -
      this.#a[1] * this.#y[1];

    this.#x[1] = this.#x[0];
    this.#x[0] = input;

    this.#y[1] = this.#y[0];
    this.#y[0] = output;

    return output;
  }

  /**
   * Sets new filter coefficients.
   * @param { number[] } a - Feedback coefficients [a1, a2]
   * @param { number[] } b - Feedforward coefficients [b0, b1, b2]
   * @returns { void }
   */
  set(a: number[], b: number[]): void {
    a.length = 2;
    this.#a.set(a);

    b.length = 3;
    this.#b.set(b);
  }

  /**
   * Resets the filter state.
   * @returns { void }
   */
  reset(): void {
    this.#x.fill(0);
    this.#y.fill(0);
  }
}

/**
 * Computes ITU-R BS.1770-5 K-weighting filter coefficients dynamically based on sample rate.
 * This matches the libebur128 implementation exactly.
 */
function computeKWeightingCoefficients(sampleRate: number): {
  highshelf: { a: [number, number]; b: [number, number, number] };
  highpass: { a: [number, number]; b: [number, number, number] };
} {
  // High-shelf filter design parameters
  let f0 = 1681.974450955533;
  let G = 3.999843853973347;
  let Q = 0.7071752369554196;

  let K = Math.tan((Math.PI * f0) / sampleRate);
  let Vh = Math.pow(10, G / 20);
  let Vb = Math.pow(Vh, 0.4996667741545416);

  let a0 = 1 + K / Q + K * K;
  const pb: [number, number, number] = [
    (Vh + (Vb * K) / Q + K * K) / a0,
    (2 * (K * K - Vh)) / a0,
    (Vh - (Vb * K) / Q + K * K) / a0,
  ];
  const pa: [number, number, number] = [
    1,
    (2 * (K * K - 1)) / a0,
    (1 - K / Q + K * K) / a0,
  ];

  // High-pass filter design parameters
  f0 = 38.13547087602444;
  Q = 0.5003270373238773;
  K = Math.tan((Math.PI * f0) / sampleRate);

  const rb: [number, number, number] = [1, -2, 1];
  const ra: [number, number, number] = [
    1,
    (2 * (K * K - 1)) / (1 + K / Q + K * K),
    (1 - K / Q + K * K) / (1 + K / Q + K * K),
  ];

  return {
    highshelf: { a: [pa[1], pa[2]], b: pb },
    highpass: { a: [ra[1], ra[2]], b: rb },
  };
}

export { BiquadraticFilter, computeKWeightingCoefficients };
