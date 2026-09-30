import { describe, expect, test } from "vite-plus/test";
import { K_WEIGHTING_COEFFICIENTS, SAMPLE_RATE } from "#common/constants";
import { retarget } from "#utils/k-weighting";

describe("retarget", () => {
  test("preserves the BS.1770-5 coefficients at the reference sample rate", () => {
    expect(retarget(K_WEIGHTING_COEFFICIENTS.stage1, SAMPLE_RATE, SAMPLE_RATE)).toEqual(
      K_WEIGHTING_COEFFICIENTS.stage1,
    );
    expect(retarget(K_WEIGHTING_COEFFICIENTS.stage2, SAMPLE_RATE, SAMPLE_RATE)).toEqual(
      K_WEIGHTING_COEFFICIENTS.stage2,
    );
  });

  test("retargets both stages to 44100 Hz", () => {
    const expected = {
      stage1: {
        a: [-1.6639018004963195, 0.7127748580936343],
        b: [1.5308803241355344, -2.6513512928671936, 1.1693440263289745],
      },
      stage2: {
        a: [-1.9891696777723498, 0.9891990399071315],
        b: [0.9995600666184937, -1.9991201332369875, 0.9995600666184937],
      },
    };

    const highshelf = retarget(K_WEIGHTING_COEFFICIENTS.stage1, SAMPLE_RATE, 44_100);
    const highpass = retarget(K_WEIGHTING_COEFFICIENTS.stage2, SAMPLE_RATE, 44_100);

    expect(highshelf).toEqual(expected.stage1);
    expect(highpass).toEqual(expected.stage2);
  });

  test("retargets both stages to 96000 Hz", () => {
    const expected = {
      stage1: {
        a: [-1.844138864893892, 0.855438563724233],
        b: [1.5596385964093107, -2.926014988443491, 1.3776760908645218],
      },
      stage2: {
        a: [-1.9950175369743988, 0.9950237513099397],
        b: [1.0024927850966858, -2.0049855701933716, 1.0024927850966858],
      },
    };

    const highshelf = retarget(K_WEIGHTING_COEFFICIENTS.stage1, SAMPLE_RATE, 96_000);
    const highpass = retarget(K_WEIGHTING_COEFFICIENTS.stage2, SAMPLE_RATE, 96_000);

    expect(highshelf).toEqual(expected.stage1);
    expect(highpass).toEqual(expected.stage2);
  });

  test("rejects non-positive sample rates", () => {
    expect(() => retarget(K_WEIGHTING_COEFFICIENTS.stage1, 0, SAMPLE_RATE)).toThrow(RangeError);
    expect(() => retarget(K_WEIGHTING_COEFFICIENTS.stage1, SAMPLE_RATE, -1)).toThrow(RangeError);
  });
});
