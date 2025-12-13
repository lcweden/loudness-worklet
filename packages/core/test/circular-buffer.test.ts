import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CircularBuffer } from "../src/utils/circular-buffer.ts";

describe("CircularBuffer", () => {
  it("initial state", () => {
    const buf = new CircularBuffer<number>(3);
    assert.strictEqual(buf.length, 0);
    assert.strictEqual(buf.isEmpty(), true);
    assert.strictEqual(buf.isFull(), false);
    assert.strictEqual(buf.capacity, 3);
  });

  it("push within capacity", () => {
    const buf = new CircularBuffer<number>(3);
    buf.push(1);
    buf.push(2);
    assert.strictEqual(buf.length, 2);
    assert.deepStrictEqual([...buf], [1, 2]);
  });

  it("push over capacity overwrites oldest", () => {
    const buf = new CircularBuffer<number>(3);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4);
    assert.strictEqual(buf.length, 3);
    assert.deepStrictEqual([...buf], [2, 3, 4]);
  });

  it("pop order and empty end state", () => {
    const buf = new CircularBuffer<number>(3);
    buf.push(10);
    buf.push(11);
    assert.strictEqual(buf.pop(), 10);
    assert.strictEqual(buf.pop(), 11);
    assert.strictEqual(buf.pop(), undefined);
    assert.strictEqual(buf.isEmpty(), true);
  });

  it("peek does not remove", () => {
    const buf = new CircularBuffer<number>(2);
    buf.push(5);
    buf.push(6);
    assert.strictEqual(buf.peek(), 5);
    assert.strictEqual(buf.length, 2);
  });

  it("slice honors bounds and wrap", () => {
    const buf = new CircularBuffer<number>(4);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4);
    buf.push(5); // overwrite 1
    // buffer logical: 2,3,4,5
    assert.deepStrictEqual(buf.slice(0, buf.length), [2, 3, 4, 5]);
    assert.deepStrictEqual(buf.slice(-10, 2), [2, 3]); // start<0 trimmed
    assert.deepStrictEqual(buf.slice(1, 100), [3, 4, 5]); // end clamped
    assert.deepStrictEqual(buf.slice(2, 2), []);
  });

  it("iterator matches slice", () => {
    const buf = new CircularBuffer<string>(3);
    ["a", "b", "c", "d"].forEach((x) => { buf.push(x); }); // now b,c,d
    assert.deepStrictEqual([...buf], buf.slice(0, buf.length));
  });
});
