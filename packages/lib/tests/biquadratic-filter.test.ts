import { expect, test, describe } from "vite-plus/test";
import BiquadraticFilter from "#modules/biquadratic-filter";

describe("BiquadraticFilter", () => {
  test("should act as an identity filter (bypass) when only b0 is 1", () => {
    const filter = new BiquadraticFilter([0, 0], [1, 0, 0]);
    const input = new Float32Array([0.5, -0.2, 0.8, -1.0]);
    const expected = new Float32Array(input);

    filter.process(input);

    expect(input).toEqual(expected);
  });

  test("should delay the signal by exactly one sample when only b1 is 1", () => {
    const filter = new BiquadraticFilter([0, 0], [0, 1, 0]);
    const input = new Float32Array([1.0, 2.0, 3.0, 4.0]);

    filter.process(input);

    expect(input).toEqual(new Float32Array([0.0, 1.0, 2.0, 3.0]));
  });

  test("should retain state across multiple block processing calls", () => {
    const filter = new BiquadraticFilter([0, 0], [0, 1, 0]);
    const block1 = new Float32Array([1.0, 2.0]);
    const block2 = new Float32Array([3.0, 4.0]);

    filter.process(block1);

    expect(block1).toEqual(new Float32Array([0.0, 1.0]));

    filter.process(block2);

    expect(block2).toEqual(new Float32Array([2.0, 3.0]));
  });

  test("should modify the input buffer in-place", () => {
    const filter = new BiquadraticFilter([0, 0], [0.5, 0, 0]);
    const input = new Float32Array([1.0, 2.0]);
    const originalReference = input;

    filter.process(input);

    expect(input).toBe(originalReference);
    expect(input).toEqual(new Float32Array([0.5, 1.0]));
  });
});
