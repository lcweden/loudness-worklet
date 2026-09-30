import type { LoudnessSnapshot, ValidationResult, ValidationRule } from "#common/types";

/**
 * Validation rules for different audio sequences based on their filenames.
 *
 * @see https://www.itu.int/pub/R-REP-BS.2217
 * @see https://tech.ebu.ch/publications/tech3341
 * @see https://tech.ebu.ch/publications/tech3342
 */
const ruleset: { pattern: RegExp; rules: ValidationRule[] }[] = [
  {
    pattern: /^seq-3341-1(?:[._-]|$)/i,
    rules: [
      { time: 1, metric: "momentaryLoudness", expected: -23, tolerances: [0.1] },
      { time: 1, metric: "integratedLoudness", expected: -23, tolerances: [0.1] },
      { time: 3, metric: "shortTermLoudness", expected: -23, tolerances: [0.1] },
    ],
  },
  {
    pattern: /^seq-3341-2(?:[._-]|$)/i,
    rules: [
      { time: 1, metric: "momentaryLoudness", expected: -33, tolerances: [0.1] },
      { time: 1, metric: "integratedLoudness", expected: -33, tolerances: [0.1] },
      { time: 3, metric: "shortTermLoudness", expected: -33, tolerances: [0.1] },
    ],
  },
  {
    pattern: /^seq-3341-3(?:[._-]|$)/i,
    rules: [{ time: 79, metric: "integratedLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-4(?:[._-]|$)/i,
    rules: [{ time: 99, metric: "integratedLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-5(?:[._-]|$)/i,
    rules: [{ time: 60, metric: "integratedLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-6(?:[._-]|$)/i,
    rules: [{ time: 19, metric: "integratedLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-7_seq-3342-5(?:[._-]|$)/i,
    rules: [
      { time: 27, metric: "integratedLoudness", expected: -23, tolerances: [0.1] },
      { time: 27, metric: "loudnessRange", expected: 5, tolerances: [1] },
    ],
  },
  {
    pattern: /^seq-3341-(?:2011-)?8_seq-3342-6(?:[._-]|$)/i,
    rules: [
      { time: 246, metric: "integratedLoudness", expected: -23, tolerances: [0.1] },
      { time: 246, metric: "loudnessRange", expected: 15, tolerances: [1] },
    ],
  },
  {
    pattern: /^seq-3341-9(?:[._-]|$)/i,
    rules: [{ time: 3, metric: "shortTermLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-10-1(?:[._-]|$)/i,
    rules: [{ time: 3, metric: "maximumShortTermLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-10-[2-7](?:[._-]|$)/i,
    rules: [{ time: 4, metric: "maximumShortTermLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-10-(?:[89]|1[0-4])(?:[._-]|$)/i,
    rules: [{ time: 5, metric: "maximumShortTermLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-10-(?:1[5-9]|20)(?:[._-]|$)/i,
    rules: [{ time: 6, metric: "maximumShortTermLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-11(?:[._-]|$)/i,
    rules: [
      { time: 3, metric: "maximumShortTermLoudness", expected: -38, tolerances: [0.1] },
      { time: 10, metric: "maximumShortTermLoudness", expected: -37, tolerances: [0.1] },
      { time: 16, metric: "maximumShortTermLoudness", expected: -36, tolerances: [0.1] },
      { time: 22, metric: "maximumShortTermLoudness", expected: -35, tolerances: [0.1] },
      { time: 28, metric: "maximumShortTermLoudness", expected: -34, tolerances: [0.1] },
      { time: 34, metric: "maximumShortTermLoudness", expected: -33, tolerances: [0.1] },
      { time: 40, metric: "maximumShortTermLoudness", expected: -32, tolerances: [0.1] },
      { time: 47, metric: "maximumShortTermLoudness", expected: -31, tolerances: [0.1] },
      { time: 53, metric: "maximumShortTermLoudness", expected: -30, tolerances: [0.1] },
      { time: 59, metric: "maximumShortTermLoudness", expected: -29, tolerances: [0.1] },
      { time: 65, metric: "maximumShortTermLoudness", expected: -28, tolerances: [0.1] },
      { time: 71, metric: "maximumShortTermLoudness", expected: -27, tolerances: [0.1] },
      { time: 77, metric: "maximumShortTermLoudness", expected: -26, tolerances: [0.1] },
      { time: 83, metric: "maximumShortTermLoudness", expected: -25, tolerances: [0.1] },
      { time: 90, metric: "maximumShortTermLoudness", expected: -24, tolerances: [0.1] },
      { time: 96, metric: "maximumShortTermLoudness", expected: -23, tolerances: [0.1] },
      { time: 102, metric: "maximumShortTermLoudness", expected: -22, tolerances: [0.1] },
      { time: 108, metric: "maximumShortTermLoudness", expected: -21, tolerances: [0.1] },
      { time: 114, metric: "maximumShortTermLoudness", expected: -20, tolerances: [0.1] },
      { time: 120, metric: "maximumShortTermLoudness", expected: -19, tolerances: [0.1] },
    ],
  },
  {
    pattern: /^seq-3341-12(?:[._-]|$)/i,
    rules: [{ time: 1, metric: "momentaryLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-13-\d+(?:[._-]|$)/i,
    rules: [{ time: 1, metric: "maximumMomentaryLoudness", expected: -23, tolerances: [0.1] }],
  },
  {
    pattern: /^seq-3341-14(?:[._-]|$)/i,
    rules: [
      { time: 0.8, metric: "maximumMomentaryLoudness", expected: -38, tolerances: [0.1] },
      { time: 1.6, metric: "maximumMomentaryLoudness", expected: -37, tolerances: [0.1] },
      { time: 2.4, metric: "maximumMomentaryLoudness", expected: -36, tolerances: [0.1] },
      { time: 3.2, metric: "maximumMomentaryLoudness", expected: -35, tolerances: [0.1] },
      { time: 4.1, metric: "maximumMomentaryLoudness", expected: -34, tolerances: [0.1] },
      { time: 4.9, metric: "maximumMomentaryLoudness", expected: -33, tolerances: [0.1] },
      { time: 5.7, metric: "maximumMomentaryLoudness", expected: -32, tolerances: [0.1] },
      { time: 6.5, metric: "maximumMomentaryLoudness", expected: -31, tolerances: [0.1] },
      { time: 7.3, metric: "maximumMomentaryLoudness", expected: -30, tolerances: [0.1] },
      { time: 8.2, metric: "maximumMomentaryLoudness", expected: -29, tolerances: [0.1] },
      { time: 9.0, metric: "maximumMomentaryLoudness", expected: -28, tolerances: [0.1] },
      { time: 9.8, metric: "maximumMomentaryLoudness", expected: -27, tolerances: [0.1] },
      { time: 10.6, metric: "maximumMomentaryLoudness", expected: -26, tolerances: [0.1] },
      { time: 11.5, metric: "maximumMomentaryLoudness", expected: -25, tolerances: [0.1] },
      { time: 12.3, metric: "maximumMomentaryLoudness", expected: -24, tolerances: [0.1] },
      { time: 13.1, metric: "maximumMomentaryLoudness", expected: -23, tolerances: [0.1] },
      { time: 13.9, metric: "maximumMomentaryLoudness", expected: -22, tolerances: [0.1] },
      { time: 14.7, metric: "maximumMomentaryLoudness", expected: -21, tolerances: [0.1] },
      { time: 15.5, metric: "maximumMomentaryLoudness", expected: -20, tolerances: [0.1] },
      { time: 16.0, metric: "maximumMomentaryLoudness", expected: -19, tolerances: [0.1] },
    ],
  },
  {
    pattern: /^seq-3341-1[5-8](?:[._-]|$)/i,
    rules: [{ time: 3, metric: "maximumTruePeakLevel", expected: -6, tolerances: [-0.4, 0.2] }],
  },
  {
    pattern: /^seq-3341-19(?:[._-]|$)/i,
    rules: [{ time: 3, metric: "maximumTruePeakLevel", expected: 3, tolerances: [-0.4, 0.2] }],
  },
  {
    pattern: /^seq-3341-2[0-3](?:[._-]|$)/i,
    rules: [{ time: 3, metric: "maximumTruePeakLevel", expected: 0, tolerances: [-0.4, 0.2] }],
  },
  {
    pattern: /^seq-3342-1(?:[._-]|$)/i,
    rules: [{ time: 40, metric: "loudnessRange", expected: 10, tolerances: [1] }],
  },
  {
    pattern: /^seq-3342-2(?:[._-]|$)/i,
    rules: [{ time: 40, metric: "loudnessRange", expected: 5, tolerances: [1] }],
  },
  {
    pattern: /^seq-3342-3(?:[._-]|$)/i,
    rules: [{ time: 40, metric: "loudnessRange", expected: 20, tolerances: [1] }],
  },
  {
    pattern: /^seq-3342-4(?:[._-]|$)/i,
    rules: [{ time: 100, metric: "loudnessRange", expected: 15, tolerances: [1] }],
  },
];

/**
 * Validates the loudness snapshots of an audio file against predefined rules based on the filename.
 *
 * @param filename The name of the audio file to validate.
 * @param snapshots An array of loudness snapshots for the audio file.
 * @returns An array of validation results or undefined if no rules match the filename.
 */
function validate(filename: string, snapshots: LoudnessSnapshot[]): ValidationResult[] | undefined {
  const matched = ruleset.find(({ pattern }) => pattern.test(filename));

  if (!matched) {
    return undefined;
  }

  const results: ValidationResult[] = [];

  for (const rule of matched.rules) {
    let closest = snapshots[0];
    let min = Math.abs(closest.currentTime - rule.time);

    for (const snapshot of snapshots) {
      const diff = Math.abs(snapshot.currentTime - rule.time);

      if (diff < min) {
        min = diff;
        closest = snapshot;
      }
    }

    if (!closest) {
      continue;
    }

    const actual = closest[rule.metric];
    let passed = false;

    if (rule.tolerances.length === 1) {
      const [tolerance] = rule.tolerances;

      passed = Math.abs(actual - rule.expected) <= tolerance + 1e-4;
    } else {
      const [first, second] = rule.tolerances;
      const lower = Math.min(first, second) - 1e-4;
      const upper = Math.max(first, second) + 1e-4;
      const diff = actual - rule.expected;

      passed = diff >= lower && diff <= upper;
    }

    results.push({ rule, actual, passed });
  }

  return results;
}

export { validate };
