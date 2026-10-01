<script lang="ts">
  import LoudnessNode from "#api/loudness-node";
  import type { LoudnessSnapshot } from "#common/types";
  import moduleURL from "#scripts/loudness-processor?url";
  import { validate } from "#utils/validation";

  let message = $state<string>("");
  let filename = $state<string>();
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

      filename = name;
      message = "";

      console.log(`[${name}] decoding audio...`);

      try {
        const array = await file.arrayBuffer();
        const buffer = await decoder.decodeAudioData(array);
        const { length, sampleRate, numberOfChannels } = buffer;
        const context = new OfflineAudioContext(numberOfChannels, length + sampleRate, sampleRate);

        await context.audioWorklet.addModule(moduleURL);

        const source = new AudioBufferSourceNode(context, { buffer });
        const loudness = new LoudnessNode(context, { interval: 0.2, numberOfInputs: 1 });

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
          const passed = results.every((r) => r.passed);
          const table = results.map(({ rule, actual, passed }) => ({
            time: `${rule.time}s`,
            metric: rule.metric,
            actual: actual !== undefined ? Number(actual.toFixed(2)) : undefined,
            expected: rule.expected,
            tolerance: rule.tolerances.join(" ~ "),
            status: passed ? "PASS" : "FAIL",
          }));

          console.info(`[${name}] compliance validation: ${passed ? "PASSED ✅" : "FAILED ❌"}`);
          console.table(table);

          const failed = results.filter((r) => !r.passed);

          if (failed.length > 0) {
            console.warn(`[${name}] ${failed.length} rule(s) failed:`, failed);
          }
        }

        console.log(`[${name}] rendered in ${duration.toFixed(2)}ms`);
      } catch (cause) {
        message = cause instanceof Error ? cause.message : String(cause);
      } finally {
        decoder.close();
      }
    }
  }
</script>

<main>
  <h1>Loudness Worklet Playground</h1>

  <section>
    <h2>Select An Audio Or Video File</h2>
    <input type="file" accept="audio/*, video/*" multiple {onchange} />
    {#if filename}
      <p>
        File: <strong>{filename}</strong>
      </p>
    {/if}
    {#if message}
      <p>{message}</p>
    {/if}
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
      <dt>Maximum Momentary Loudness (LUFS)</dt>
      <dd>{snapshot?.maximumMomentaryLoudness.toFixed(1) ?? "-"}</dd>
      <dt>Maximum Short-Term Loudness (LUFS)</dt>
      <dd>{snapshot?.maximumShortTermLoudness.toFixed(1) ?? "-"}</dd>
      <dt>Maximum True Peak Level (dBTP)</dt>
      <dd>{snapshot?.maximumTruePeakLevel.toFixed(1) ?? "-"}</dd>
    </dl>
    <details open>
      <summary>Raw Snapshot</summary>
      <pre>{JSON.stringify(snapshot, null, 2)}</pre>
    </details>
  </section>

  <section>
    <h2>ITU-R BS.1770-5 Reference</h2>
    <ul>
      <li>
        <strong>LUFS</strong>: Loudness Units relative to Full Scale, standardized loudness measure.
      </li>
      <li><strong>Momentary</strong>: 400ms sliding window loudness.</li>
      <li><strong>Short-Term</strong>: 3s sliding window loudness.</li>
      <li><strong>Integrated</strong>: Overall loudness over the program.</li>
      <li><strong>Loudness Range</strong>: Statistical measure of loudness variation.</li>
      <li>
        <strong>Maximum True Peak Level</strong>: Maximum sample-accurate peak, considering
        inter-sample peaks.
      </li>
    </ul>
    <p>
      <a href="https://www.itu.int/rec/R-REC-BS.1770/en" rel="noreferrer" target="_blank">
        ITU-R BS.1770-5 Official Recommendation
      </a>
    </p>
  </section>

  <section>
    <h2>Compliance References</h2>
    <p>
      Compliance test files and specifications for verifying Recommendation ITU-R BS.1770 and EBU
      R128:
    </p>
    <ul>
      <li>
        <a href="https://www.itu.int/pub/R-REP-BS.2217" rel="noreferrer" target="_blank">
          ITU-R BS.2217 Compliance Material
        </a>
      </li>
      <li>
        <a href="https://tech.ebu.ch/publications/tech3341" rel="noreferrer" target="_blank">
          EBU Tech 3341 (Loudness Metering)
        </a>
      </li>
      <li>
        <a href="https://tech.ebu.ch/publications/tech3342" rel="noreferrer" target="_blank">
          EBU Tech 3342 (Loudness Range)
        </a>
      </li>
    </ul>
    <p>
      <small>Open browser DevTools for compliance validation results.</small>
    </p>
  </section>
</main>
