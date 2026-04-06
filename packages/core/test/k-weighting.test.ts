import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeKWeightingCoefficients } from "../src/utils/k-weighting.ts";

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

    assert.ok(Math.abs(coeffs.highshelf.a[0] - COEFFS.highshelf.a[0]) < E);
    assert.ok(Math.abs(coeffs.highshelf.a[1] - COEFFS.highshelf.a[1]) < E);
    assert.ok(Math.abs(coeffs.highshelf.b[0] - COEFFS.highshelf.b[0]) < E);
    assert.ok(Math.abs(coeffs.highshelf.b[1] - COEFFS.highshelf.b[1]) < E);
    assert.ok(Math.abs(coeffs.highshelf.b[2] - COEFFS.highshelf.b[2]) < E);

    assert.ok(Math.abs(coeffs.highpass.a[0] - COEFFS.highpass.a[0]) < E);
    assert.ok(Math.abs(coeffs.highpass.a[1] - COEFFS.highpass.a[1]) < E);
    assert.ok(Math.abs(coeffs.highpass.b[0] - COEFFS.highpass.b[0]) < E);
    assert.ok(Math.abs(coeffs.highpass.b[1] - COEFFS.highpass.b[1]) < E);
    assert.ok(Math.abs(coeffs.highpass.b[2] - COEFFS.highpass.b[2]) < E);
  });

  it("should compute coefficients for 96000 Hz sample rate", () => {
    const E = 1e-10;
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

    assert.ok(Math.abs(coeffs.highshelf.a[0] - COEFFS.highshelf.a[0]) < E);
    assert.ok(Math.abs(coeffs.highshelf.a[1] - COEFFS.highshelf.a[1]) < E);
    assert.ok(Math.abs(coeffs.highshelf.b[0] - COEFFS.highshelf.b[0]) < E);
    assert.ok(Math.abs(coeffs.highshelf.b[1] - COEFFS.highshelf.b[1]) < E);
    assert.ok(Math.abs(coeffs.highshelf.b[2] - COEFFS.highshelf.b[2]) < E);

    assert.ok(Math.abs(coeffs.highpass.a[0] - COEFFS.highpass.a[0]) < E);
    assert.ok(Math.abs(coeffs.highpass.a[1] - COEFFS.highpass.a[1]) < E);
    assert.ok(Math.abs(coeffs.highpass.b[0] - COEFFS.highpass.b[0]) < E);
    assert.ok(Math.abs(coeffs.highpass.b[1] - COEFFS.highpass.b[1]) < E);
    assert.ok(Math.abs(coeffs.highpass.b[2] - COEFFS.highpass.b[2]) < E);
  });
});
