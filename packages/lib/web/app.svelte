<script lang="ts">
  import LoudnessNode from "#api/loudness-node";
  import type { LoudnessSnapshot } from "#common/types";
  import moduleURL from "#scripts/loudness-processor?url";

  let snapshot = $state<LoudnessSnapshot>();
  let error = $state<string>();

  async function handleChange(event: Event) {
    error = undefined;
    snapshot = undefined;

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const array = await file.arrayBuffer();
      const buffer = await new AudioContext().decodeAudioData(array);
      const { length, sampleRate, numberOfChannels } = buffer;
      const context = new OfflineAudioContext(numberOfChannels, length, sampleRate);

      await context.audioWorklet.addModule(moduleURL);

      const source = new AudioBufferSourceNode(context, { buffer });
      const loudness = new LoudnessNode(context, { numberOfInputs: 1 });

      loudness.port.onmessage = (event: MessageEvent<Float32Array[]>) => {
        snapshot = LoudnessNode.from(event.data[0]);
      };

      source.connect(loudness).connect(context.destination);
      source.start();

      console.time("Rendering");
      await context.startRendering();
      console.timeEnd("Rendering");
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<main>
  <h1>Playground</h1>

  <section>
    <h2>Select An Audio Or Video File</h2>
    <input type="file" onchange={handleChange} />
    {#if error}<p>{error}</p>{/if}
  </section>

  <section>
    <h2>Loudness Measurement</h2>
    <dl>
      <dt>Momentary Loudness (LUFS)</dt>
      <dd>{snapshot?.momentaryLoudness.toFixed(1) ?? "-"}</dd>
      <dt>Short-Term Loudness (LUFS)</dt>
      <dd>{snapshot?.shortTermLoudness.toFixed(1) ?? "-"}</dd>
      <dt>Integrated Loudness (LUFS)</dt>
      <dd>{snapshot?.integratedLoudness.toFixed(1) ?? "-"}</dd>
      <dt>Loudness Range (LU)</dt>
      <dd>{snapshot?.loudnessRange.toFixed(1) ?? "-"}</dd>
      <dt>Maximum True Peak Level (dBTP)</dt>
      <dd>{snapshot?.maximumTruePeakLevel.toFixed(1) ?? "-"}</dd>
    </dl>
    <details open>
      <summary>Raw Data</summary>
      <pre>{JSON.stringify(snapshot, null, 2)}</pre>
    </details>
  </section>

  <section>
    <h2>ITU-R BS.1770-5 Reference</h2>
    <ul>
      <li><strong>LUFS</strong>: Loudness Units relative to Full Scale, standardized loudness measure.</li>
      <li><strong>Momentary</strong>: 400ms sliding window loudness.</li>
      <li><strong>Short-Term</strong>: 3s sliding window loudness.</li>
      <li><strong>Integrated</strong>: Overall loudness over the program.</li>
      <li><strong>Loudness Range</strong>: Statistical measure of loudness variation.</li>
      <li><strong>Maximum True Peak Level</strong>: Maximum sample-accurate peak, considering inter-sample peaks.</li>
    </ul>
    <p>
      <a href="https://www.itu.int/rec/R-REC-BS.1770/en" rel="noreferrer" target="_blank">
        ITU-R BS.1770-5 Official Recommendation
      </a>
    </p>
  </section>

  <section>
    <h2>ITU-R BS.2217 Reference</h2>
    <p>
      This Report contains a table of compliance test files and related information for verifying
      that a meter meets the specifications within Recommendation ITU-R BS.1770.
    </p>
    <p>
      <a href="https://www.itu.int/pub/R-REP-BS.2217" rel="noreferrer" target="_blank">
        Compliance material for Recommendation ITU-R BS.1770
      </a>
    </p>
  </section>
</main>
