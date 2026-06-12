import { expect, test, describe } from "vite-plus/test";
import PolyphaseFiniteImpulseResponseFilter from "#modules/polyphase-finite-impulse-response-filter";

describe("PolyphaseFiniteImpulseResponseFilter", () => {
  test("should output interleaved coefficients when fed an impulse", () => {
    const taps = 2;
    const coefficients = [
      [1.0, 2.0],
      [3.0, 4.0],
    ];
    const filter = new PolyphaseFiniteImpulseResponseFilter(taps, coefficients);
    const input = new Float32Array([1.0, 0.0, 0.0]);
    const output = new Float32Array(6);

    filter.process(input, output);
    expect(output).toEqual(new Float32Array([1.0, 3.0, 2.0, 4.0, 0.0, 0.0]));
  });

  test("should retain history state across multiple block processes", () => {
    const filter = new PolyphaseFiniteImpulseResponseFilter(2, [[1.0, 1.0]]);
    const block1 = new Float32Array([1.0]);
    const out1 = new Float32Array(1);
    const block2 = new Float32Array([0.0]);
    const out2 = new Float32Array(1);

    filter.process(block1, out1);
    expect(out1[0]).toBe(1.0);

    filter.process(block2, out2);
    expect(out2[0]).toBe(1.0);
  });
});
