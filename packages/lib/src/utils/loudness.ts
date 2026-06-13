/**
 * Converts energy to loudness in decibels (dB).
 *
 * @param energy The energy value to convert.
 * @returns {number} The corresponding loudness in decibels (dB).
 */
function energyToLoudness(energy: number): number {
  return -0.691 + 10 * Math.log10(Math.max(energy, Number.EPSILON));
}

/**
 * Converts loudness in decibels (dB) to energy.
 *
 * @param loudness The loudness value in decibels (dB) to convert.
 * @returns {number} The corresponding energy value.
 */
function loudnessToEnergy(loudness: number): number {
  return 10 ** ((loudness + 0.691) / 10);
}

export { energyToLoudness, loudnessToEnergy };
