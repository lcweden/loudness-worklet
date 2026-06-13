import { expect, test, describe } from "vite-plus/test";
import CircularBuffer from "#modules/circular-buffer";

describe("CircularBuffer", () => {
  test("should start with length 0", () => {
    expect(new CircularBuffer(4).length).toBe(0);
  });

  test("should increase length as items are pushed", () => {
    const buf = new CircularBuffer(4);

    buf.push(1);
    buf.push(2);

    expect(buf.length).toBe(2);
  });

  test("should not exceed capacity", () => {
    const buf = new CircularBuffer(3);

    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4);

    expect(buf.length).toBe(3);
  });

  test("should return correct sum", () => {
    const buf = new CircularBuffer(4);

    buf.push(1);
    buf.push(2);
    buf.push(3);

    expect(buf.sum()).toBe(6);
  });

  test("should reflect overwritten values in sum when buffer is full", () => {
    const buf = new CircularBuffer(3);

    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(10);

    expect(buf.sum()).toBe(15);
  });
});
