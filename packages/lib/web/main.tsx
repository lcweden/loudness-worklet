import { createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import module from "#scripts/loudness-processor?url";
import LoudnessNode from "#src/index";
import type { LoudnessSnapshot } from "#src/index";

function Playground() {
  const [getAudioBuffer, setAudioBuffer] = createSignal<AudioBuffer>();
  const [getSnapshot, setSnapshot] = createSignal<LoudnessSnapshot>();
  const [getError, setError] = createSignal<Error>();

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files || [];
    const file = files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = handleFileLoad;
  }

  function handleFileLoad(event: ProgressEvent<FileReader>) {
    const reader = event.target as FileReader;
    const arrayBuffer = reader.result as ArrayBuffer;
    new AudioContext().decodeAudioData(arrayBuffer).then(setAudioBuffer).catch(setError);
  }

  function handleAudioWorkletMessage(event: MessageEvent) {
    setSnapshot(LoudnessNode.from(event.data[0]));
  }

  createEffect(async () => {
    const audioBuffer = getAudioBuffer();

    if (!audioBuffer) return;

    try {
      const { length, sampleRate, numberOfChannels } = audioBuffer;
      const context = new OfflineAudioContext(numberOfChannels, length, sampleRate);

      await context.audioWorklet.addModule(module);

      const source = new AudioBufferSourceNode(context, { buffer: audioBuffer });
      const loudness = new LoudnessNode(context, { numberOfInputs: 1 });

      loudness.port.onmessage = handleAudioWorkletMessage;

      source.connect(loudness).connect(context.destination);
      source.start();

      console.time("1");
      await context.startRendering();
      console.timeEnd("1");
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  });

  return (
    <main>
      <h1>Playground</h1>
      <section>
        <h2>Select An Audio Or Video File</h2>
        <input onchange={handleFileChange} type="file" />
        <p>{getError()?.message}</p>
      </section>
      <section>
        <h2>Loudness Measurement</h2>
        <dl>
          <dt>Momentary Loudness (LUFS)</dt>
          <dd>{getSnapshot()?.momentaryLoudness.toFixed(1) ?? "-"}</dd>
          <dt>Short-Term Loudness (LUFS)</dt>
          <dd>{getSnapshot()?.shortTermLoudness.toFixed(1) ?? "-"}</dd>
          <dt>Integrated Loudness (LUFS)</dt>
          <dd>{getSnapshot()?.integratedLoudness.toFixed(1) ?? "-"}</dd>
          <dt>Loudness Range (LU)</dt>
          <dd>{getSnapshot()?.loudnessRange.toFixed(1) ?? "-"}</dd>
          <dt>Maximum True Peak Level (dBTP)</dt>
          <dd>{getSnapshot()?.truePeak.toFixed(1) ?? "-"}</dd>
        </dl>
        <details open>
          <summary>Raw Data</summary>
          <pre>{JSON.stringify(getSnapshot(), null, 2)}</pre>
        </details>
      </section>
      <section>
        <h2>ITU-R BS.1770-5 Reference</h2>
        <ul>
          <li>
            <strong>LUFS</strong>: Loudness Units relative to Full Scale, standardized loudness
            measure.
          </li>
          <li>
            <strong>Momentary</strong>: 400ms sliding window loudness.
          </li>
          <li>
            <strong>Short-Term</strong>: 3s sliding window loudness.
          </li>
          <li>
            <strong>Integrated</strong>: Overall loudness over the program.
          </li>
          <li>
            <strong>Loudness Range</strong>: Statistical measure of loudness variation.
          </li>
          <li>
            <strong>True Peak</strong>: Maximum sample-accurate peak, considering inter-sample
            peaks.
          </li>
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
          This Report contains a table of compliance test files and related information for
          verifying that a meter meets the specifications within Recommendation ITU-R BS.1770.
        </p>
        <p>
          <a href="https://www.itu.int/pub/R-REP-BS.2217" rel="noreferrer" target="_blank">
            Compliance material for Recommendation ITU-R BS.1770
          </a>
        </p>
      </section>
    </main>
  );
}

const root = document.getElementById("root");

if (root) {
  render(() => <Playground />, root);
}
