import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { K_WEIGHTING_COEFFICIENTS } from "#common/constants";
import { BiquadraticFilter } from "#filters/biquadratic-filter";
import { computeKWeightingCoefficients } from "#utils/k-weighting";

describe("compute K-Weighting coefficients", () => {
  const E = 1e-10;

  it("should compute coefficients for 48000 Hz sample rate", () => {
    const COEFFS = {
      highshelf: {
        a: [-1.69065929318241, 0.73248077421585],
        b: [1.53512485958697, -2.69169618940638, 1.19839281085285],
      },
      highpass: {
        a: [-1.99004745483398, 0.99007225036621],
        b: [1, -2, 1],
      },
    };

    const coeffs = computeKWeightingCoefficients(48000);

    for (let i = 0; i < 2; i++) {
      assert.ok(Math.abs(coeffs.highshelf.a[i] - COEFFS.highshelf.a[i]) < E);
      assert.ok(Math.abs(coeffs.highpass.a[i] - COEFFS.highpass.a[i]) < E);
    }
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(coeffs.highshelf.b[i] - COEFFS.highshelf.b[i]) < E);
      assert.ok(Math.abs(coeffs.highpass.b[i] - COEFFS.highpass.b[i]) < E);
    }
  });

  it("should compute coefficients for 96000 Hz sample rate", () => {
    const COEFFS = {
      highshelf: {
        a: [-1.84460946989011, 0.85584332293064],
        b: [1.5597142289758, -2.92674157825108, 1.37826120231582],
      },
      highpass: {
        a: [-1.99501754472472, 0.99502375904092],
        b: [1, -2, 1],
      },
    };

    const coeffs = computeKWeightingCoefficients(96000);

    for (let i = 0; i < 2; i++) {
      assert.ok(Math.abs(coeffs.highshelf.a[i] - COEFFS.highshelf.a[i]) < E);
      assert.ok(Math.abs(coeffs.highpass.a[i] - COEFFS.highpass.a[i]) < E);
    }
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(coeffs.highshelf.b[i] - COEFFS.highshelf.b[i]) < E);
      assert.ok(Math.abs(coeffs.highpass.b[i] - COEFFS.highpass.b[i]) < E);
    }
  });

  it("should compute coefficients for 44100 Hz sample rate", () => {
    const COEFFS = {
      highshelf: {
        a: [-1.6636551132560204, 0.7125954280732254],
        b: [1.5308412300503478, -2.6509799951547297, 1.169079079921587],
      },
      highpass: {
        a: [-1.989169673629796, 0.9891990357870393],
        b: [1, -2, 1],
      },
    };

    const coeffs = computeKWeightingCoefficients(44100);

    for (let i = 0; i < 2; i++) {
      assert.ok(Math.abs(coeffs.highshelf.a[i] - COEFFS.highshelf.a[i]) < E);
      assert.ok(Math.abs(coeffs.highpass.a[i] - COEFFS.highpass.a[i]) < E);
    }
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(coeffs.highshelf.b[i] - COEFFS.highshelf.b[i]) < E);
      assert.ok(Math.abs(coeffs.highpass.b[i] - COEFFS.highpass.b[i]) < E);
    }
  });

  it("should produce identical filter output to hardcoded constants at 48000 Hz", () => {
    const computedCoeffs = computeKWeightingCoefficients(48000);
    const { highshelf, highpass } = K_WEIGHTING_COEFFICIENTS;

    const oldFilters = [
      new BiquadraticFilter(highshelf.a, highshelf.b),
      new BiquadraticFilter(highpass.a, highpass.b),
    ];
    const newFilters = [
      new BiquadraticFilter(
        computedCoeffs.highshelf.a,
        computedCoeffs.highshelf.b,
      ),
      new BiquadraticFilter(
        computedCoeffs.highpass.a,
        computedCoeffs.highpass.b,
      ),
    ];

    for (let n = 0; n < 4800; n++) {
      const input = Math.sin((2 * Math.PI * 997 * n) / 48000);

      const oldOut = oldFilters.reduce((s, f) => f.process(s), input);
      const newOut = newFilters.reduce((s, f) => f.process(s), input);

      assert.ok(
        Math.abs(oldOut - newOut) < 1e-12,
        `Sample ${n}: old=${oldOut}, new=${newOut}, diff=${Math.abs(oldOut - newOut)}`,
      );
    }
  });
});
