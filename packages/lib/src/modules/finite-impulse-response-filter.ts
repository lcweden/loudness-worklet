class FiniteImpulseResponseFilter {
  #coefficients: Float32Array[];
  #history: Float32Array;
  #numberOfFactors: number;
  #numberOfPhases: number;
  #index: number;

  constructor(numberOfFactors: number, coefficients: number[][]) {
    this.#coefficients = coefficients.map((phase) => new Float32Array(phase));
    this.#history = new Float32Array(numberOfFactors);
    this.#numberOfFactors = numberOfFactors;
    this.#numberOfPhases = coefficients.length;
    this.#index = 0;
  }

  process(input: Float32Array, output: Float32Array): void {
    for (let i = 0; i < input.length; i++) {
      this.#history[this.#index] = input[i];

      for (let p = 0; p < this.#numberOfPhases; p++) {
        const coefs = this.#coefficients[p];
        let sum = 0;

        for (let c = 0; c < this.#numberOfFactors; c++) {
          let index = this.#index - c;
          if (index < 0) {
            index += this.#numberOfFactors;
          }
          sum += coefs[c] * this.#history[index];
        }

        output[i * this.#numberOfPhases + p] = sum;
      }

      this.#index++;

      if (this.#index >= this.#numberOfFactors) {
        this.#index = 0;
      }
    }
  }
}

export default FiniteImpulseResponseFilter;
