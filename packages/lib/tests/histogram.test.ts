import { expect, test, describe } from "vite-plus/test";
import Histogram from "#modules/histogram";

describe("Histogram", () => {
  test("constructor sets correct properties", () => {
    const h = new Histogram(-10, 10, 1);
    expect(h.min).toBe(-10);
    expect(h.step).toBe(1);
    expect(h.size).toBe(20);
    expect(h.bins).toBeInstanceOf(Uint32Array);
  });

  test("constructor throws RangeError when min >= max", () => {
    expect(() => new Histogram(5, 5, 1)).toThrow(RangeError);
    expect(() => new Histogram(10, 5, 1)).toThrow(RangeError);
  });

  test("constructor throws RangeError when step is not strictly positive", () => {
    expect(() => new Histogram(0, 10, 0)).toThrow(RangeError);
    expect(() => new Histogram(0, 10, -1)).toThrow(RangeError);
  });

  test("add increments the correct bin", () => {
    const h = new Histogram(0, 10, 1);
    h.add(0);
    h.add(0.5);
    h.add(1);
    expect(h.bins[0]).toBe(2);
    expect(h.bins[1]).toBe(1);
  });

  test("add ignores values below min", () => {
    const h = new Histogram(0, 10, 1);
    h.add(-1);
    h.add(-100);
    expect(h.bins.every((b) => b === 0)).toBe(true);
  });

  test("bins are all zero initially", () => {
    const h = new Histogram(-5, 5, 0.5);
    expect(h.bins.every((b) => b === 0)).toBe(true);
  });

  test("size equals number of bins based on range and step", () => {
    const h = new Histogram(0, 10, 2);
    expect(h.size).toBe(5);
  });

  test("add accumulates multiple values in same bin", () => {
    const h = new Histogram(0, 10, 1);
    h.add(3);
    h.add(3.1);
    h.add(3.9);
    expect(h.bins[3]).toBe(3);
  });
});
