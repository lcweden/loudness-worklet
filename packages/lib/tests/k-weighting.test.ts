import { expect, test, describe } from "vite-plus/test";
import { K_WEIGHTING_COEFFICIENTS } from "#common/constants";
import { computeKWeightingCoefficients } from "#utils/k-weighting";

describe("computeKWeightingCoefficients", () => {
  test("should compute coefficients for 44100 Hz sample rate", () => {
    const K_WEIGHTING_COEFFICIENTS = {
      highshelf: {
        a: [-1.6636551132560204, 0.7125954280732254],
        b: [1.5308412300503478, -2.6509799951547297, 1.169079079921587],
      },
      highpass: {
        a: [-1.989169673629796, 0.9891990357870393],
        b: [1, -2, 1],
      },
    };

    const coefficients = computeKWeightingCoefficients(44100);

    for (let i = 0; i < 2; i++) {
      expect(coefficients.highshelf.a[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highshelf.a[i], 9);
      expect(coefficients.highpass.a[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highpass.a[i], 9);
    }
    for (let i = 0; i < 3; i++) {
      expect(coefficients.highshelf.b[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highshelf.b[i], 9);
      expect(coefficients.highpass.b[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highpass.b[i], 9);
    }
  });

  test("should compute K_WEIGHTING_COEFFICIENTS for 48000 Hz sample rate", () => {
    const coefficients = computeKWeightingCoefficients(48000);

    for (let i = 0; i < 2; i++) {
      expect(coefficients.highshelf.a[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highshelf.a[i], 9);
      expect(coefficients.highpass.a[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highpass.a[i], 9);
    }

    for (let i = 0; i < 3; i++) {
      expect(coefficients.highshelf.b[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highshelf.b[i], 9);
      expect(coefficients.highpass.b[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highpass.b[i], 9);
    }
  });

  test("should compute coefficients for 96000 Hz sample rate", () => {
    const K_WEIGHTING_COEFFICIENTS = {
      highshelf: {
        a: [-1.84460946989011, 0.85584332293064],
        b: [1.5597142289758, -2.92674157825108, 1.37826120231582],
      },
      highpass: {
        a: [-1.99501754472472, 0.99502375904092],
        b: [1, -2, 1],
      },
    };

    const coefficients = computeKWeightingCoefficients(96000);

    for (let i = 0; i < 2; i++) {
      expect(coefficients.highshelf.a[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highshelf.a[i], 9);
      expect(coefficients.highpass.a[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highpass.a[i], 9);
    }
    for (let i = 0; i < 3; i++) {
      expect(coefficients.highshelf.b[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highshelf.b[i], 9);
      expect(coefficients.highpass.b[i]).toBeCloseTo(K_WEIGHTING_COEFFICIENTS.highpass.b[i], 9);
    }
  });
});
