import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { BiquadraticFilter } from "../src/filters/biquadratic-filter.ts";

describe("BiquadraticFilter", () => {
  let filter: BiquadraticFilter;

  beforeEach(() => {
    // Simple pass-through filter coefficients for basic testing
    // b = [1, 0, 0], a = [0, 0]
    filter = new BiquadraticFilter([0, 0], [1, 0, 0]);
  });

  describe("constructor", () => {
    it("should create a new filter with given coefficients", () => {
      const newFilter = new BiquadraticFilter([0.5, 0.25], [1, 0.5, 0.25]);
      assert.ok(newFilter instanceof BiquadraticFilter);
    });

    it("should initialize with zero state", () => {
      const output = filter.process(0);
      assert.strictEqual(output, 0);
    });
  });

  describe("process", () => {
    it("should pass through input when using identity coefficients", () => {
      const input = 0.5;
      const output = filter.process(input);
      assert.ok(Math.abs(output - input) < 1e-10);
    });

    it("should process multiple samples correctly", () => {
      const inputs = [1, 2, 3, 4, 5];
      const outputs = inputs.map((input) => filter.process(input));
      assert.deepStrictEqual(outputs, inputs);
    });

    it("should apply low-pass filter coefficients correctly", () => {
      // Simple low-pass filter (approximate)
      // These coefficients create a basic averaging filter
      const lpFilter = new BiquadraticFilter([0, 0], [0.25, 0.5, 0.25]);

      lpFilter.process(0); // Initialize state
      lpFilter.process(1); // Ramp up
      const output = lpFilter.process(1);

      // Output should be smoothed (less than input due to averaging)
      assert.ok(output > 0);
      assert.ok(output <= 1);
    });

    it("should maintain filter state between calls", () => {
      const testFilter = new BiquadraticFilter([0.5, 0], [1, 0, 0]);

      const out1 = testFilter.process(1);
      const out2 = testFilter.process(0);

      // Second output should be affected by first input due to feedback
      assert.notStrictEqual(out2, 0);
      assert.ok(Math.abs(out2 - -0.5 * out1) < 1e-10);
    });

    it("should handle negative inputs correctly", () => {
      const output = filter.process(-0.5);
      assert.ok(Math.abs(output - -0.5) < 1e-10);
    });

    it("should handle zero inputs correctly", () => {
      const output = filter.process(0);
      assert.strictEqual(output, 0);
    });
  });

  describe("set", () => {
    it("should update filter coefficients", () => {
      // Set to identity filter
      filter.set([0, 0], [1, 0, 0]);
      let output = filter.process(1);
      assert.ok(Math.abs(output - 1) < 1e-10);

      // Change coefficients
      filter.reset();
      filter.set([0, 0], [0.5, 0, 0]);
      output = filter.process(1);
      assert.ok(Math.abs(output - 0.5) < 1e-10);
    });

    it("should handle coefficient arrays with extra elements", () => {
      // The set method truncates arrays to correct length
      filter.set([0.1, 0.2, 0.3, 0.4], [1, 0.5, 0.25, 0.1, 0.05]);
      const output = filter.process(1);
      assert.notStrictEqual(output, undefined);
      assert.strictEqual(typeof output, "number");
    });

    it("should work with new coefficients immediately", () => {
      filter.set([0, 0], [2, 0, 0]);
      const output = filter.process(1);
      assert.ok(Math.abs(output - 2) < 1e-10);
    });
  });

  describe("reset", () => {
    it("should clear filter state", () => {
      // Process some samples to build up state
      filter.set([-0.5, 0.25], [1, 0.5, 0.25]);
      filter.process(1);
      filter.process(1);
      filter.process(1);

      // Reset
      filter.reset();

      // After reset, same input should give same output as initial state
      filter.set([0, 0], [1, 0, 0]);
      const output = filter.process(0);
      assert.strictEqual(output, 0);
    });

    it("should reset internal buffers to zero", () => {
      const testFilter = new BiquadraticFilter([0.9, 0], [1, 0, 0]);

      // Build up state
      testFilter.process(1);
      testFilter.process(1);

      // Reset
      testFilter.reset();

      // Process zero - should get zero if state is truly reset
      const output = testFilter.process(0);
      assert.strictEqual(output, 0);
    });

    it("should allow filter to work normally after reset", () => {
      filter.process(1);
      filter.process(2);
      filter.reset();

      const output = filter.process(1);
      assert.ok(Math.abs(output - 1) < 1e-10);
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

    it("should handle rapid coefficient changes", () => {
      filter.set([0, 0], [1, 0, 0]);
      filter.process(1);

      filter.set([0, 0], [0.5, 0, 0]);
      const output = filter.process(1);

      assert.ok(Math.abs(output - 0.5) < 1e-10);
    });

    it("should produce stable output with feedback coefficients", () => {
      // Test with stable filter coefficients
      const stableFilter = new BiquadraticFilter([-0.1, 0.05], [0.3, 0.2, 0.1]);

      // Process enough samples to see if it remains stable
      let output = 0;
      for (let i = 0; i < 100; i++) {
        output = stableFilter.process(1);
      }

      // Output should be finite and not NaN
      assert.notStrictEqual(output, undefined);
      assert.strictEqual(Number.isFinite(output), true);
      assert.strictEqual(Number.isNaN(output), false);
    });
  });
});
