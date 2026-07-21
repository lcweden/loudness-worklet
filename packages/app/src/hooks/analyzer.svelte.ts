import LoudnessNode from "@loudness-worklet/lib";
import type { LoudnessSnapshot } from "@loudness-worklet/lib";
import moduleURL from "@loudness-worklet/lib/loudness.worklet?url";

class AudioAnalyzer {
  decoder = new AudioContext();
  buffer = $state<AudioBuffer>();
  progress = $state<number>(0);
  processing = $state<boolean>(false);
  snapshots = $state<LoudnessSnapshot[]>([]);
  snapshot = $state<LoudnessSnapshot>();

  async render(file: File) {
    this.buffer = undefined;
    this.progress = 0;
    this.processing = true;
    this.snapshots = [];
    this.snapshot = undefined;

    try {
      this.buffer = await this.decoder.decodeAudioData(await file.arrayBuffer());

      const { length, sampleRate, numberOfChannels } = this.buffer;
      const context = new OfflineAudioContext(numberOfChannels, length, sampleRate);

      await context.audioWorklet.addModule(moduleURL);

      const source = new AudioBufferSourceNode(context, { buffer: this.buffer });
      const loudness = new LoudnessNode(context);

      loudness.port.onmessage = (event: MessageEvent<Float32Array[]>) => {
        const [input] = event.data;
        const snapshot = LoudnessNode.from(input);

        this.progress = Math.min(1, snapshot.currentFrame / length);
        this.snapshots.push(snapshot);
        this.snapshot = snapshot;
      };

      source.connect(loudness).connect(context.destination);
      source.start();

      await context.startRendering();
    } catch {
      this.buffer = undefined;
      this.snapshots = [];
      this.snapshot = undefined;
    } finally {
      this.processing = false;
      this.progress = 1;
    }
  }
}

export default AudioAnalyzer;
