# Loudness Worklet

[![npm version](https://img.shields.io/npm/v/loudness-worklet.svg)](https://www.npmjs.com/package/loudness-worklet)
[![license](https://img.shields.io/github/license/lcweden/loudness-worklet.svg)](LICENSE)
[![demo](https://img.shields.io/badge/demo-Online-purple.svg)](https://lcweden.github.io/loudness-worklet/)

A loudness meter for the `Web Audio API`, based on the [ITU-R BS.1770-5](https://www.itu.int/rec/R-REC-BS.1770) standard and implemented as an AudioWorkletProcessor.

[![screenshot](https://github.com/lcweden/loudness-worklet/blob/main/packages/app/public/screenshots/2.png)](https://lcweden.github.io/loudness-worklet/)

## Installation

Install via [npm](https://www.npmjs.com/package/loudness-worklet):

```bash
npm install loudness-worklet
```

Or import directly using **jsDelivr** or **unpkg**:

```javascript
import LoudnessNode from "https://cdn.jsdelivr.net/npm/loudness-worklet/+esm";
```

Before instantiating a `LoudnessNode`, ensure the `AudioWorkletProcessor` is loaded via `audioContext.audioWorklet.addModule()`.

1. Download from the GitHub Release: [loudness.worklet.js](https://github.com/lcweden/loudness-worklet/releases/latest/download/loudness.worklet.js).
2. Load it from a CDN: [loudness.worklet.js](https://cdn.jsdelivr.net/npm/loudness-worklet/packages/lib/dist/loudness.worklet.js)

```javascript
import LoudnessNode from "loudness-worklet";

const moduleUrl = "/assets/loudness.worklet.js";
const audioContext = new AudioContext();

await audioContext.audioWorklet.addModule(moduleUrl);

const loudnessNode = new LoudnessNode(audioContext);
```

## Quick Start

Load the AudioWorklet module once for each audio context before creating a `LoudnessNode`.

### File Analysis

```javascript
import LoudnessNode from "loudness-worklet";

async function getLoudnessData(file) {
  const { promise, resolve, reject } = Promise.withResolvers();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
    const { length, sampleRate, numberOfChannels } = audioBuffer;
    const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);

    await offlineContext.audioWorklet.addModule(moduleUrl);

    const sourceNode = new AudioBufferSourceNode(offlineContext, { buffer: audioBuffer });
    const loudnessNode = new LoudnessNode(offlineContext, { numberOfInputs: 1 });
    let snapshot;

    loudnessNode.port.onmessage = (event) => {
      const [input] = event.data;
      snapshot = LoudnessNode.from(input);
    };

    sourceNode.connect(loudnessNode).connect(offlineContext.destination);
    sourceNode.start();

    await offlineContext.startRendering();

    if (!snapshot) {
      throw new Error("No data received");
    }

    resolve(snapshot);
  } catch (error) {
    reject(error);
  }

  return promise;
}
```

### Live Analysis

```javascript
import LoudnessNode from "loudness-worklet";

const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();

await audioContext.audioWorklet.addModule(moduleUrl);

const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
const loudnessNode = new LoudnessNode(audioContext);

loudnessNode.port.onmessage = (event) => {
  const [input] = event.data;
  const snapshot = LoudnessNode.from(input);

  console.log(snapshot);
};

sourceNode.connect(loudnessNode).connect(audioContext.destination);
```

## Interfaces

The following sections describe the exported interfaces:

### LoudnessNode

`LoudnessNode` is a pass-through `AudioWorkletNode` that measures each connected audio input.

```javascript
import LoudnessNode from "loudness-worklet";

const loudnessNode = new LoudnessNode(audioContext, {
  interval: 0.1,
  numberOfInputs: 1,
});
```

`LoudnessNode` instances provide the following methods and properties:

| Method                 | Type     | Description                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------ |
| `from`                 | `static` | Converts raw metrics into a `LoudnessSnapshot`.                    |
| `metricCount`          | `getter` | Returns the required length of the `Float32Array` for the metrics. |
| `getFloatLoudnessData` | `method` | Copies the latest loudness metrics into a `Float32Array`.          |

### LoudnessOptions

Options passed to the `LoudnessNode` constructor.

```typescript
import type { LoudnessOptions } from "loudness-worklet";
```

| Option           | Type     | Default | Description                                                                  |
| ---------------- | -------- | ------- | ---------------------------------------------------------------------------- |
| `interval`       | `number` | `0.1`   | Seconds between updates sent by the AudioWorklet. Must be a non-zero number. |
| `numberOfInputs` | `number` | `1`     | Number of independent audio inputs to measure. Must be a positive integer.   |

### LoudnessSnapshot

Interface representing the loudness metrics at a specific point in time.

```typescript
import type { LoudnessSnapshot } from "loudness-worklet";
```

| Property                   | Description                            | Unit |
| -------------------------- | -------------------------------------- | ---- |
| `currentFrame`             | Current audio-context frame index.     |      |
| `currentTime`              | Current audio-context time in seconds. |      |
| `loudnessRange`            | Loudness range.                        | LU   |
| `momentaryLoudness`        |                                        | LUFS |
| `shortTermLoudness`        |                                        | LUFS |
| `integratedLoudness`       |                                        | LUFS |
| `maximumMomentaryLoudness` | Highest measured momentary loudness.   | LUFS |
| `maximumShortTermLoudness` | Highest measured short-term loudness.  | LUFS |
| `maximumTruePeakLevel`     | Highest measured true peak.            | dBTP |

## Data Retrieval

The `LoudnessNode` provides two distinct ways to access data: **Push-based** and **Pull-based**. While both are available, you should **choose only one** strategy depending on your application's architecture to avoid redundancy.

### Push Based

This is the common approach. The AudioWorklet automatically sends metrics to the main thread at a fixed frequency.

```javascript
// Set interval to send updates every 100ms
const loudnessNode = new LoudnessNode(audioContext, { interval: 0.1 });

loudnessNode.port.onmessage = (event) => {
  const [input] = event.data; // event.data[0] contains the Float32Array for the first input
  const snapshot = LoudnessNode.from(input);

  console.log(snapshot);
};
```

> [!NOTE]
> The `interval` option dictates exactly how often the AudioWorklet dispatches these messages.

### Pull Based

This approach is useful for scenarios where you want to retrieve the latest metrics on demand, such as in a rendering loop.

```javascript
const loudnessNode = new LoudnessNode(audioContext);
const bufferLength = loudnessNode.metricCount;
const dataArray = new Float32Array(bufferLength);

function draw() {
  // Schedule next redraw
  requestAnimationFrame(draw);

  // Get spectrum data
  loudnessNode.getFloatLoudnessData(dataArray);

  // Convert the raw data into a LoudnessSnapshot
  const snapshot = LoudnessNode.from(dataArray);
}

draw();
```

> [!TIP]
> This pattern is similar to how [AnalyserNode.getFloatFrequencyData()](https://developer.mozilla.org/ja/docs/Web/API/AnalyserNode/getFloatFrequencyData) works.

#### SharedArrayBuffer Mode

The internal behavior of `LoudnessNode` dynamically adapts `SharedArrayBuffer` based on `globalThis.crossOriginIsolated`.

If `COOP` and `COEP` headers are set, the AudioWorklet writes metrics directly to a `SharedArrayBuffer` at every audio block(per 128 samples), when `getFloatLoudnessData()` is called, it reads directly from that shared memory.

Otherwise, it falls back to a local cache on the main thread, which is updated via internal `message` events. The `interval` setting controls the refresh rate of this pulled data.

## Implementation Details

The following sections provide additional details about the implementation.

### Channels

Supported channel counts: `1`, `2`, `5`, `6`, `8`, `10`, `12`, `24`

> [!NOTE]
> Channel counts not listed above are weighted at `1.0`.

### Coefficients

The following coefficients are used for the K-weighting filter:

|     | highshelf         | highpass          |
| --- | ----------------- | ----------------- |
| a1  | -1.69065929318241 | -1.99004745483398 |
| a2  | 0.73248077421585  | 0.99007225036621  |
| b0  | 1.53512485958697  | 1.0               |
| b1  | -2.69169618940638 | -2.0              |
| b2  | 1.19839281085285  | 1.0               |

> [!NOTE]
> The coefficients above are derived from the [ITU-R BS.1770-5](https://www.itu.int/rec/R-REC-BS.1770-5) standard, which is mainly for 48 kHz audio.
> For other sample rates, the coefficients are adjusted dynamically.

The following FIR filter coefficients are used for true-peak measurement:

| Phase 0          | Phase 1          | Phase 2          | Phase 3          |
| ---------------- | ---------------- | ---------------- | ---------------- |
| 0.0017089843750  | -0.0291748046875 | -0.0189208984375 | -0.0083007812500 |
| 0.0109863281250  | 0.0292968750000  | 0.0330810546875  | 0.0148925781250  |
| -0.0196533203125 | -0.0517578125000 | -0.0582275390625 | -0.0266113281250 |
| 0.0332031250000  | 0.0891113281250  | 0.1015625000000  | 0.0476074218750  |
| -0.0594482421875 | -0.1665039062500 | -0.2003173828125 | -0.1022949218750 |
| 0.1373291015625  | 0.4650878906250  | 0.7797851562500  | 0.9721679687500  |
| 0.9721679687500  | 0.7797851562500  | 0.4650878906250  | 0.1373291015625  |
| -0.1022949218750 | -0.2003173828125 | -0.1665039062500 | -0.0594482421875 |
| 0.0476074218750  | 0.1015625000000  | 0.0891113281250  | 0.0332031250000  |
| -0.0266113281250 | -0.0582275390625 | -0.0517578125000 | -0.0196533203125 |
| 0.0148925781250  | 0.0330810546875  | 0.0292968750000  | 0.0109863281250  |
| -0.0083007812500 | -0.0189208984375 | -0.0291748046875 | 0.0017089843750  |

## Validation

### ITU-R BS.2217

Code correctness is verified against the official **[ITU-R BS.2217](https://www.itu.int/pub/R-REP-BS.2217)** compliance test suite, ensuring strict adherence to the **[ITU-R BS.1770](https://www.itu.int/rec/R-REC-BS.1770)** specification. Measurements are taken from the final offline-rendered snapshot.

| File                                 | Channels | Measurement |                    |
| ------------------------------------ | -------: | ----------: | :----------------: |
| 1770Comp_2_RelGateTest               |        2 |  -10.0 LKFS | :white_check_mark: |
| 1770Comp_2_AbsGateTest               |        2 |  -69.5 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_25Hz_2ch           |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_100Hz_2ch          |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_500Hz_2ch          |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_1000Hz_2ch         |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_2000Hz_2ch         |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_10000Hz_2ch        |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_25Hz_2ch           |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_100Hz_2ch          |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_500Hz_2ch          |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_1000Hz_2ch         |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_2000Hz_2ch         |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_10000Hz_2ch        |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_18LKFS_FrequencySweep     |        1 |  -18.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_SummingTest        |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_SummingTest        |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_ChannelCheckLeft   |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_ChannelCheckRight  |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_ChannelCheckCentre |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_ChannelCheckLFE    |        6 |   -inf LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_ChannelCheckLs     |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_24LKFS_ChannelCheckRs     |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_ChannelCheckLeft   |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_ChannelCheckRight  |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_ChannelCheckCentre |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_ChannelCheckLFE    |        6 |   -inf LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_ChannelCheckLs     |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770Comp_2_23LKFS_ChannelCheckRs     |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770-2 Conf 6ch VinCntr-24LKFS       |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770-2 Conf 6ch VinL+R-24LKFS        |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770-2 Conf 6ch VinL-R-C-24LKFS      |        6 |  -24.0 LKFS | :white_check_mark: |
| 1770-2 Conf Stereo VinL+R-24LKFS     |        2 |  -24.0 LKFS | :white_check_mark: |
| 1770-2 Conf Mono Voice+Music-24LKFS  |        1 |  -24.0 LKFS | :white_check_mark: |
| 1770-2 Conf 6ch VinCntr-23LKFS       |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770-2 Conf 6ch VinL+R-23LKFS        |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770-2 Conf 6ch VinL-R-C-23LKFS      |        6 |  -23.0 LKFS | :white_check_mark: |
| 1770-2 Conf Stereo VinL+R-23LKFS     |        2 |  -23.0 LKFS | :white_check_mark: |
| 1770-2 Conf Mono Voice+Music-23LKFS  |        1 |  -23.0 LKFS | :white_check_mark: |
| 1770Conf-8channels_24LKFS            |        8 |  -24.0 LKFS | :white_check_mark: |
| 1770Conf-8channels_23LKFS            |        8 |  -23.0 LKFS | :white_check_mark: |
| 1770Conf-10channels_24LKFS           |       10 |  -24.0 LKFS | :white_check_mark: |
| 1770Conf-10channels_23LKFS           |       10 |  -23.0 LKFS | :white_check_mark: |
| 1770Conf-12channels_24LKFS           |       12 |  -24.0 LKFS | :white_check_mark: |
| 1770Conf-12channels_23LKFS           |       12 |  -23.0 LKFS | :white_check_mark: |
| 1770Conf-24channels_24LKFS           |       24 |  -24.0 LKFS | :white_check_mark: |
| 1770Conf-24channels_23LKFS           |       24 |  -23.0 LKFS | :white_check_mark: |

> [!TIP]
> If `decodeAudioData` fails, it's often due to the browser's specific support for the audio file's format (codec), container, or channel layout, rather than a general API incompatibility.
> Try a different browser or convert the audio file to a more widely supported format.
> For example, Chrome has limited support for certain codecs in audio files, while Safari offers broader support. (1770Conf-24channels_24LKFS)

### EBU TECH 3341

Validated against **[EBU TECH 3341](https://tech.ebu.ch/publications/tech3341)** minimum requirements for loudness metering, including gating behavior, time scales, and true-peak accuracy.

| Signal                | Expected response and accepted tolerances                            |                    |
| --------------------- | -------------------------------------------------------------------- | :----------------: |
| seq-3341-1            | M, S, I = -23.0 ±0.1 LUFS<br>M, S, I = 0.0 ±0.1 LU                   | :white_check_mark: |
| seq-3341-2            | M, S, I = -33.0 ±0.1 LUFS<br>M, S, I = -10.0 ±0.1 LU                 | :white_check_mark: |
| seq-3341-3            | I = -23.0 ±0.1 LUFS<br>I = 0.0 ±0.1 LU                               | :white_check_mark: |
| seq-3341-4            | I = -23.0 ±0.1 LUFS<br>I = 0.0 ±0.1 LU                               | :white_check_mark: |
| seq-3341-5            | I = -23.0 ±0.1 LUFS<br>I = 0.0 ±0.1 LU                               | :white_check_mark: |
| seq-3341-6            | I = -23.0 ±0.1 LUFS<br>I = 0.0 ±0.1 LU                               | :white_check_mark: |
| seq-3341-7_seq-3342-5 | I = -23.0 ±0.1 LUFS<br>I = 0.0 ±0.1 LU                               | :white_check_mark: |
| seq-3341-8_seq-3342-6 | I = -23.0 ±0.1 LUFS<br>I = 0.0 ±0.1 LU                               | :white_check_mark: |
| seq-3341-9            | S = -23.0 ±0.1 LUFS, constant after 3 s                              | :white_check_mark: |
| seq-3341-10-\*        | Max S = -23.0 ±0.1 LUFS, for each segment                            | :white_check_mark: |
| seq-3341-11           | Max S = -38.0, -37.0, -36.0, ..., -19.0 ±0.1 LUFS, successive values | :white_check_mark: |
| seq-3341-12           | M = -23.0 ±0.1 LUFS, constant after 1 s                              | :white_check_mark: |
| seq-3341-13-\*        | Max M = -23.0 ±0.1 LUFS, for each segment                            | :white_check_mark: |
| seq-3341-14           | Max M = -38.0, -37.0, -36.0, ..., -19.0 ±0.1 LUFS, successive values | :white_check_mark: |
| seq-3341-15           | Max true-peak level = -6.0 +0.2/-0.4 dBTP                            | :white_check_mark: |
| seq-3341-16           | Max true-peak level = -6.0 +0.2/-0.4 dBTP                            | :white_check_mark: |
| seq-3341-17           | Max true-peak level = -6.0 +0.2/-0.4 dBTP                            | :white_check_mark: |
| seq-3341-18           | Max true-peak level = -6.0 +0.2/-0.4 dBTP                            | :white_check_mark: |
| seq-3341-19           | Max true-peak level = +3.0 +0.2/-0.4 dBTP                            | :white_check_mark: |
| seq-3341-20           | Max true-peak level = 0.0 +0.2/-0.4 dBTP                             | :white_check_mark: |
| seq-3341-21           | Max true-peak level = 0.0 +0.2/-0.4 dBTP                             | :white_check_mark: |
| seq-3341-22           | Max true-peak level = 0.0 +0.2/-0.4 dBTP                             |     -0.45 dBTP     |
| seq-3341-23           | Max true-peak level = 0.0 +0.2/-0.4 dBTP                             | :white_check_mark: |

> [!NOTE]
> The marginal deviation of 0.05 dBTP in `seq-3341-22` is expected behavior.
> The True Peak FIR coefficients are strictly optimized for 48 kHz, which causes a negligible roll-off when applied to a 44.1 kHz test signal.

### EBU TECH 3342 Minimum requirements test signals

[EBU TECH 3342](https://tech.ebu.ch/publications/tech3342) focuses on the measurement of loudness range.

| file                  | Expected response and accepted tolerances |                    |
| --------------------- | ----------------------------------------- | :----------------: |
| seq-3342-1            | LRA = 10 ±1 LU                            | :white_check_mark: |
| seq-3342-2            | LRA = 5 ±1 LU                             | :white_check_mark: |
| seq-3342-3            | LRA = 20 ±1 LU                            | :white_check_mark: |
| seq-3342-4            | LRA = 15 ±1 LU                            | :white_check_mark: |
| seq-3341-7_seq-3342-5 | LRA = 5 ±1 LU                             | :white_check_mark: |
| seq-3341-8_seq-3342-6 | LRA = 15 ±1 LU                            | :white_check_mark: |

## Acknowledgments

This project is a learning experiment aimed at exploring audio signal processing and ITU-R BS.1770 loudness measurement standards. I am not an expert in audio engineering or signal processing, and this project was developed as a way to better understand the concepts of audio loudness and implementation techniques. Thanks to the ITU-R BS.1770 standards for providing the theoretical basis for loudness measurement.

## License

This project is licensed under the [MIT License](LICENSE).

## References

- [ITU-R BS.1770](https://www.itu.int/rec/R-REC-BS.1770)
- [ITU-R BS.2217](https://www.itu.int/pub/R-REP-BS.2217)
- [EBU Tech 3341](https://tech.ebu.ch/publications/tech3341)
- [EBU Tech 3342](https://tech.ebu.ch/publications/tech3342)
