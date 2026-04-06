/**
 * Computes ITU-R BS.1770-5 K-weighting filter coefficients dynamically based on sample rate.
 * This matches the libebur128 implementation exactly.
 */
function computeKWeightingCoefficients(sampleRate: number): {
  highshelf: { a: [number, number]; b: [number, number, number] };
  highpass: { a: [number, number]; b: [number, number, number] };
} {
  // High-shelf filter design parameters
  let f0 = 1681.974450955533;
  const G = 3.999843853973347;
  let Q = 0.7071752369554196;

  let K = Math.tan((Math.PI * f0) / sampleRate);
  const Vh = 10 ** (G / 20);
  const Vb = Vh ** 0.4996667741545416;

  const a0 = 1 + K / Q + K * K;
  const pb: [number, number, number] = [
    (Vh + (Vb * K) / Q + K * K) / a0,
    (2 * (K * K - Vh)) / a0,
    (Vh - (Vb * K) / Q + K * K) / a0,
  ];
  const pa: [number, number, number] = [
    1,
    (2 * (K * K - 1)) / a0,
    (1 - K / Q + K * K) / a0,
  ];

  // High-pass filter design parameters
  f0 = 38.13547087602444;
  Q = 0.5003270373238773;
  K = Math.tan((Math.PI * f0) / sampleRate);

  const rb: [number, number, number] = [1, -2, 1];
  const ra: [number, number, number] = [
    1,
    (2 * (K * K - 1)) / (1 + K / Q + K * K),
    (1 - K / Q + K * K) / (1 + K / Q + K * K),
  ];

  return {
    highshelf: { a: [pa[1], pa[2]], b: pb },
    highpass: { a: [ra[1], ra[2]], b: rb },
  };
}

export { computeKWeightingCoefficients };
