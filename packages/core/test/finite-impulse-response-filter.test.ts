import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { FiniteImpulseResponseFilter } from "../src/filters/finite-impulse-response-filter.ts";

describe("FiniteImpulseResponseFilter", () => {
  let filter: FiniteImpulseResponseFilter;

  beforeEach(() => {
    // Simple pass-through filter: [1]
    filter = new FiniteImpulseResponseFilter([1]);
  });

  describe("constructor", () => {
    it("should create a new filter with given coefficients", () => {
      const newFilter = new FiniteImpulseResponseFilter([1, 0.5, 0.25]);
      assert.ok(newFilter instanceof FiniteImpulseResponseFilter);
    });

    it("should initialize with zero state", () => {
      const output = filter.process(0);
      assert.strictEqual(output, 0);
    });

    it("should accept single coefficient", () => {
      const singleCoeffFilter = new FiniteImpulseResponseFilter([2]);
      const output = singleCoeffFilter.process(1);
      assert.strictEqual(output, 2);
    });

    it("should accept multiple coefficients", () => {
      const multiCoeffFilter = new FiniteImpulseResponseFilter([1, 2, 3, 4, 5]);
      assert.ok(multiCoeffFilter instanceof FiniteImpulseResponseFilter);
    });
  });

  describe("process - single sample", () => {
    it("should pass through input with identity coefficient [1]", () => {
      const output = filter.process(0.5);
      assert.ok(Math.abs(output - 0.5) < 1e-10);
    });

    it("should scale input with gain coefficient", () => {
      const gainFilter = new FiniteImpulseResponseFilter([2]);
      const output = gainFilter.process(0.5);
      assert.ok(Math.abs(output - 1.0) < 1e-10);
    });

    it("should implement moving average with equal coefficients", () => {
      // 3-point moving average: [1/3, 1/3, 1/3]
      const avgFilter = new FiniteImpulseResponseFilter([1 / 3, 1 / 3, 1 / 3]);

      avgFilter.process(1); // buffer: [1, 0, 0]
      avgFilter.process(2); // buffer: [2, 1, 0]
      const output = avgFilter.process(3); // buffer: [3, 2, 1]

      // Average of [3, 2, 1] = 2
      assert.ok(Math.abs(output - 2) < 1e-10);
    });

    it("should maintain filter state between calls", () => {
      const delayFilter = new FiniteImpulseResponseFilter([0, 1]); // 1-sample delay

      const out1 = delayFilter.process(1); // output previous buffer[1] = 0
      assert.strictEqual(out1, 0);

      const out2 = delayFilter.process(2); // output previous buffer[1] = 1
      assert.strictEqual(out2, 1);

      const out3 = delayFilter.process(3); // output previous buffer[1] = 2
      assert.strictEqual(out3, 2);
    });

    it("should handle negative inputs correctly", () => {
      const output = filter.process(-0.5);
      assert.ok(Math.abs(output - -0.5) < 1e-10);
    });

    it("should handle zero inputs correctly", () => {
      const output = filter.process(0);
      assert.strictEqual(output, 0);
    });

    it("should apply weighted sum correctly", () => {
      const weightedFilter = new FiniteImpulseResponseFilter([0.5, 0.3, 0.2]);

      weightedFilter.process(1); // buffer: [1, 0, 0] -> 0.5
      weightedFilter.process(2); // buffer: [2, 1, 0] -> 1.0 + 0.3 = 1.3
      const output = weightedFilter.process(3); // buffer: [3, 2, 1] -> 1.5 + 0.6 + 0.2 = 2.3

      assert.ok(Math.abs(output - 2.3) < 1e-10);
    });

    it("should handle long coefficient arrays", () => {
      const longCoeffs = Array(100).fill(0.01);
      const longFilter = new FiniteImpulseResponseFilter(longCoeffs);

      // Fill buffer
      for (let i = 0; i < 100; i++) {
        longFilter.process(1);
      }

      const output = longFilter.process(1);
      // Sum of 100 samples * 0.01 = 1.0
      assert.ok(Math.abs(output - 1.0) < 1e-10);
    });
  });

  describe("reset", () => {
    it("should clear filter state", () => {
      const delayFilter = new FiniteImpulseResponseFilter([0, 1]);

      // Build up state
      delayFilter.process(1);
      delayFilter.process(2);
      delayFilter.process(3);

      // Reset
      delayFilter.reset();

      // After reset, should output 0 (buffer is cleared)
      const output = delayFilter.process(5);
      assert.strictEqual(output, 0);
    });

    it("should reset buffer to all zeros", () => {
      const avgFilter = new FiniteImpulseResponseFilter([1, 1, 1]);

      // Fill buffer with non-zero values
      avgFilter.process(5);
      avgFilter.process(10);
      avgFilter.process(15);

      // Reset
      avgFilter.reset();

      // First output should only use new input (buffer is zeros)
      const output = avgFilter.process(1);
      assert.strictEqual(output, 1); // 1*1 + 1*0 + 1*0 = 1
    });

    it("should allow filter to work normally after reset", () => {
      filter.process(100);
      filter.reset();

      const output = filter.process(1);
      assert.ok(Math.abs(output - 1) < 1e-10);
    });

    it("should work correctly with multiple resets", () => {
      const testFilter = new FiniteImpulseResponseFilter([1, 1]);

      testFilter.process(5);
      testFilter.reset();
      testFilter.process(3);
      testFilter.reset();

      const output = testFilter.process(2);
      assert.strictEqual(output, 2); // Only current input
    });
  });

  describe("edge cases", () => {
    it("should handle very small numbers", () => {
      const output = filter.process(1e-10);
      assert.ok(Math.abs(output - 1e-10) < 1e-15);
    });

    it("should handle very large numbers", () => {
      const output = filter.process(1e10);
      assert.ok(Math.abs(output - 1e10) < 50000);
    });

    it("should handle zero coefficients", () => {
      const zeroFilter = new FiniteImpulseResponseFilter([0, 0, 0]);
      const output = zeroFilter.process(100);
      assert.strictEqual(output, 0);
    });

    it("should handle negative coefficients", () => {
      const negFilter = new FiniteImpulseResponseFilter([-1, -0.5]);
      negFilter.process(2); // buffer: [2, 0] -> -2
      const output = negFilter.process(4); // buffer: [4, 2] -> -4 - 1 = -5

      assert.ok(Math.abs(output - -5) < 1e-10);
    });

    it("should handle alternating signs in coefficients", () => {
      const altFilter = new FiniteImpulseResponseFilter([1, -1, 1, -1]);
      altFilter.process(1); // [1, 0, 0, 0] -> 1
      altFilter.process(1); // [1, 1, 0, 0] -> 0
      altFilter.process(1); // [1, 1, 1, 0] -> 1
      const output = altFilter.process(1); // [1, 1, 1, 1] -> 0

      assert.strictEqual(output, 0);
    });

    it("should produce consistent results with repeated inputs", () => {
      const consistentFilter = new FiniteImpulseResponseFilter([
        0.25, 0.25, 0.25, 0.25,
      ]);

      // Process same value multiple times
      consistentFilter.process(4);
      consistentFilter.process(4);
      consistentFilter.process(4);
      const output = consistentFilter.process(4);

      // Average of [4, 4, 4, 4] = 4
      assert.ok(Math.abs(output - 4) < 1e-10);
    });

    it("should handle impulse response correctly", () => {
      const impulseFilter = new FiniteImpulseResponseFilter([1, 0.5, 0.25]);

      const out1 = impulseFilter.process(1); // impulse
      const out2 = impulseFilter.process(0);
      const out3 = impulseFilter.process(0);
      const out4 = impulseFilter.process(0);

      assert.ok(Math.abs(out1 - 1) < 1e-10); // [1, 0, 0]
      assert.ok(Math.abs(out2 - 0.5) < 1e-10); // [0, 1, 0]
      assert.ok(Math.abs(out3 - 0.25) < 1e-10); // [0, 0, 1]
      assert.ok(Math.abs(out4 - 0) < 1e-10); // [0, 0, 0]
    });
  });

  describe("special filter types", () => {
    it("should implement delay line", () => {
      const delayFilter = new FiniteImpulseResponseFilter([0, 0, 0, 1]); // 3-sample delay

      delayFilter.process(1);
      delayFilter.process(2);
      delayFilter.process(3);
      const output = delayFilter.process(4);

      assert.strictEqual(output, 1); // Output is input from 3 samples ago
    });

    it("should implement differentiator", () => {
      const diffFilter = new FiniteImpulseResponseFilter([1, -1]);

      diffFilter.process(1); // [1, 0] -> 1
      diffFilter.process(3); // [3, 1] -> 2
      const output = diffFilter.process(6); // [6, 3] -> 3

      assert.strictEqual(output, 3); // Difference between consecutive samples
    });

    it("should implement simple low-pass filter", () => {
      // Simple 5-point moving average (low-pass characteristic)
      const lpFilter = new FiniteImpulseResponseFilter([
        0.2, 0.2, 0.2, 0.2, 0.2,
      ]);

      // Fill with ones
      for (let i = 0; i < 5; i++) {
        lpFilter.process(1);
      }

      const output = lpFilter.process(1);
      assert.ok(Math.abs(output - 1) < 1e-10); // Average of ones is one
    });

    it("should sum coefficients correctly for DC gain", () => {
      // Coefficients that sum to 2
      const gainFilter = new FiniteImpulseResponseFilter([0.5, 0.5, 0.5, 0.5]);

      // Fill buffer with ones
      gainFilter.process(1);
      gainFilter.process(1);
      gainFilter.process(1);
      const output = gainFilter.process(1);

      assert.ok(Math.abs(output - 2) < 1e-10); // Sum of coefficients
    });
  });
});
