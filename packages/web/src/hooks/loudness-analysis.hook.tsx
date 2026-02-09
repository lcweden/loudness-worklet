import type {
  LoudnessMeasurements,
  LoudnessSnapshot,
} from "@loudness-worklet/lib";
import { LoudnessWorkletNode } from "@loudness-worklet/lib";
import { createSignal, onCleanup, onMount } from "solid-js";

function createLoudnessAnalysis() {
  const [getSnapshots, setSnapshots] = createSignal<LoudnessSnapshot[]>([]);
  const [getMeasurements, setMeasurements] =
    createSignal<LoudnessMeasurements>();

  function handleMessage(event: MessageEvent<LoudnessSnapshot>) {
    const { data } = event;
    const { currentMeasurements } = data;
    const [measurements] = currentMeasurements;

    if (!measurements) {
      return;
    }

    setMeasurements(measurements);
    setSnapshots((prev) => [...prev, data]);
  }

  function clear() {
    setSnapshots([]);
    setMeasurements(undefined);
  }

  async function analyze(
    buffer: AudioBuffer,
    options?: { capacity?: number; interval?: number },
  ) {
    const { numberOfChannels, length, sampleRate } = buffer;
    const ctx = new OfflineAudioContext(numberOfChannels, length, sampleRate);

    await LoudnessWorkletNode.loadModule(ctx);

    const capacity = options?.capacity ?? length / sampleRate;
    const interval = options?.interval ?? 0.02;
    const option = { processorOptions: { capacity, interval } };

    const sourceNode = new AudioBufferSourceNode(ctx, { buffer });
    const workletNode = new LoudnessWorkletNode(ctx, option);

    sourceNode.connect(workletNode);
    workletNode.connect(ctx.destination);
    sourceNode.start();

    workletNode.port.onmessage = handleMessage;

    await ctx.startRendering();
  }

  onMount(() => {
    clear();
  });

  onCleanup(() => {
    clear();
  });

  return { analyze, clear, getSnapshots, getMeasurements };
}

export { createLoudnessAnalysis };
