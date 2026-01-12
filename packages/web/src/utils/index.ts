function formatChannels(numberOfChannels: number): string {
  switch (numberOfChannels) {
    case 1:
      return "Mono";
    case 2:
      return "Stereo";
    case 6:
      return "5.1 Surround";
    case 8:
      return "7.1 Surround";
    case 10:
      return "9.1 Surround";
    case 12:
      return "11.1 Surround";
    case 24:
      return "22.2 Surround";
    default:
      return `${numberOfChannels} channels`;
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatFileSize(size: number, digits: number = 1): string {
  if (size < 1024) {
    return `${size.toFixed(digits)} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(digits)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(digits)} MB`;
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(digits)} GB`;
  }
}

export { formatChannels, formatTime, formatFileSize };
