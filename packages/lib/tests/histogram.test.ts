import { expect, test, describe } from "vite-plus/test";
import Histogram from "#modules/histogram";

describe("Histogram", () => {
  test("should set correct properties", () => {
    const h = new Histogram(-10, 10, 1);

    expect(h.min).toBe(-10);
    expect(h.step).toBe(1);
    expect(h.size).toBe(20);
    expect(h.bins).toBeInstanceOf(Uint32Array);
  });

  test("should throw RangeError when min >= max", () => {
    expect(() => new Histogram(5, 5, 1)).toThrow(RangeError);
    expect(() => new Histogram(10, 5, 1)).toThrow(RangeError);
  });

  test("should throw RangeError when step is not strictly positive", () => {
    expect(() => new Histogram(0, 10, 0)).toThrow(RangeError);
    expect(() => new Histogram(0, 10, -1)).toThrow(RangeError);
  });

  test("should increment the correct bin when adding values", () => {
    const h = new Histogram(0, 10, 1);

    h.add(0);
    h.add(0.5);
    h.add(1);

    expect(h.bins[0]).toBe(2);
    expect(h.bins[1]).toBe(1);
  });

  test("should ignore values below min", () => {
    const h = new Histogram(0, 10, 1);

    h.add(-1);
    h.add(-100);

    expect(h.bins.every((b) => b === 0)).toBe(true);
  });

  test("should have all bins zero initially", () => {
    const h = new Histogram(-5, 5, 0.5);

    expect(h.bins.every((b) => b === 0)).toBe(true);
  });

  test("should have size equal to number of bins based on range and step", () => {
    const h = new Histogram(0, 10, 2);

    expect(h.size).toBe(5);
  });

  test("should accumulate multiple values in the same bin", () => {
    const h = new Histogram(0, 10, 1);

    h.add(3);
    h.add(3.1);
    h.add(3.9);

    expect(h.bins[3]).toBe(3);
  });
});
