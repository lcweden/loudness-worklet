/**
 * Converts energy to loudness in decibels (dB).
 *
 * @param energy
 * @returns
 */
function energyToLoudness(energy: number): number {
  return -0.691 + 10 * Math.log10(Math.max(energy, Number.EPSILON));
}

/**
 * Converts loudness in decibels (dB) to energy.
 *
 * @param loudness
 * @returns
 */
function loudnessToEnergy(loudness: number): number {
  return 10 ** ((loudness + 0.691) / 10);
}

export { energyToLoudness, loudnessToEnergy };
