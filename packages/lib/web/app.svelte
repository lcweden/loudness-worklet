<script lang="ts">
  import LoudnessNode from "#api/loudness-node";
  import type { LoudnessSnapshot } from "#common/types";
  import moduleURL from "#scripts/loudness-processor?url";
  import { validate } from "#utils/validation";

  let events = $state<string[]>([]);
  let snapshot = $state<LoudnessSnapshot>();

  async function onchange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files) {
      return;
    }

    for (const file of files) {
      const { name } = file;
      const decoder = new AudioContext({ sampleRate: 48000 });

      try {
        const array = await file.arrayBuffer();
        const buffer = await decoder.decodeAudioData(array);
        const { length, sampleRate, numberOfChannels } = buffer;
        const context = new OfflineAudioContext(numberOfChannels, length + sampleRate, sampleRate);

        await context.audioWorklet.addModule(moduleURL);

        const source = new AudioBufferSourceNode(context, { buffer });
        const loudness = new LoudnessNode(context, { interval: 0.1, numberOfInputs: 1 });

        const { promise, resolve } = Promise.withResolvers<number>();
        const snapshots: LoudnessSnapshot[] = [];

        loudness.port.onmessage = (event: MessageEvent<Float32Array[]>) => {
          snapshot = LoudnessNode.from(event.data[0]);
          snapshots.push(snapshot);
        };

        source.connect(loudness).connect(context.destination);
        source.start();

        const start = performance.now();

        await context.startRendering();

        const end = performance.now();

        resolve(end - start);

        const duration = await promise;
        const results = validate(name, snapshots);

        if (results) {
          const passed = results.every((result) => result.passed);

          events.push(`[${name}] Validation ${passed ? "passed" : "failed"}`);
        }

        events.push(`[${name}] Duration: ${duration.toFixed(2)}ms`);
      } catch (error) {
        const time = new Date().toLocaleTimeString();
        const message = error instanceof Error ? error.message : String(error);

        events.push(`[${time}][${name}] Error: ${message}`);
      } finally {
        decoder.close();
      }
    }
  }
</script>

<main>
  <h2>Loudness Worklet Playground</h2>
  <input type="file" accept="audio/*, video/*" multiple {onchange} />
  <code>
    {#if snapshot}
      {@const { currentFrame, currentTime } = snapshot}
      {@const { integratedLoudness, shortTermLoudness, momentaryLoudness } = snapshot}
      {@const { maximumMomentaryLoudness, maximumShortTermLoudness } = snapshot}
      {@const { maximumTruePeakLevel, loudnessRange } = snapshot}

      <p>Current Frame: {currentFrame}</p>
      <p>Current Time: {currentTime}</p>
      <p>Integrated Loudness: {integratedLoudness}</p>
      <p>Momentary Loudness: {momentaryLoudness}</p>
      <p>Short Term Loudness: {shortTermLoudness}</p>
      <p>Maximum Momentary Loudness: {maximumMomentaryLoudness}</p>
      <p>Maximum Short Term Loudness: {maximumShortTermLoudness}</p>
      <p>Maximum True Peak Level: {maximumTruePeakLevel}</p>
      <p>Loudness Range: {loudnessRange}</p>
    {:else}
      <p>No snapshot available.</p>
    {/if}
  </code>
  <ul>
    {#each events as event}
      <li>{event}</li>
    {/each}
  </ul>
</main>
