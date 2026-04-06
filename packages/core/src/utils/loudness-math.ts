function energyToLoudness(energy: number): number {
  return -0.691 + 10 * Math.log10(Math.max(energy, Number.EPSILON));
}

function loudnessToEnergy(loudness: number): number {
  return 10 ** ((loudness + 0.691) / 10);
}

export { energyToLoudness, loudnessToEnergy };
