import LoudnessNode from "#src/api/loudness-node";
import type { LoudnessSnapshot } from "#src/common/types";
import moduleURL from "#src/scripts/loudness-processor?url";
import ruleset from "#web/assets/ruleset.json" with { type: "json" };

const input = document.querySelector('input[type="file"]');

if (!input) {
  throw new Error("File input element not found");
}

input.addEventListener("change", async (event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files) {
    return;
  }

  for (const file of files) {
    const { name } = file;
    const decoder = new AudioContext({ sampleRate: 48000 });

    console.log(`[${name}] decoding audio...`);

    (document.querySelector('strong[name="filename"]') as HTMLElement).textContent = name;
    (document.querySelector('p[name="message"]') as HTMLElement).textContent = "";

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
        const snapshot = LoudnessNode.from(event.data[0]);
        const map = {
          "momentary-loudness": snapshot.momentaryLoudness.toFixed(2),
          "short-term-loudness": snapshot.shortTermLoudness.toFixed(2),
          "integrated-loudness": snapshot.integratedLoudness.toFixed(2),
          "loudness-range": snapshot.loudnessRange.toFixed(2),
          "maximum-momentary-loudness": snapshot.maximumMomentaryLoudness.toFixed(2),
          "maximum-short-term-loudness": snapshot.maximumShortTermLoudness.toFixed(2),
          "maximum-true-peak-level": snapshot.maximumTruePeakLevel.toFixed(2),
        };

        for (const [key, value] of Object.entries(map)) {
          const element = document.querySelector(`dd[name="${key}"]`) as HTMLElement;

          if (element) {
            element.textContent = value;
          }
        }

        snapshots.push(snapshot);
      };

      source.connect(loudness).connect(context.destination);
      source.start();

      const start = performance.now();

      await context.startRendering();

      const end = performance.now();

      resolve(end - start);

      const duration = await promise;

      console.log(`[${name}] rendered in ${duration.toFixed(2)}ms`);

      for (const { pattern, flags, rules } of ruleset) {
        const regex = new RegExp(pattern, flags);

        if (!regex.test(name)) {
          continue;
        }

        const results = [];

        for (const rule of rules) {
          let closest = snapshots[0];
          let min = Math.abs(closest.currentTime - rule.time);

          for (const snapshot of snapshots) {
            const diff = Math.abs(snapshot.currentTime - rule.time);

            if (diff < min) {
              min = diff;
              closest = snapshot;
            }
          }

          if (!closest) {
            continue;
          }

          const actual = closest[rule.metric as keyof LoudnessSnapshot];
          let passed = false;

          if (rule.expected === "-Infinity") {
            passed = actual === Number.NEGATIVE_INFINITY;
          } else if (rule.tolerances.length === 1) {
            const [tolerance] = rule.tolerances;

            passed = Math.abs(actual - Number(rule.expected)) <= tolerance + 1e-4;
          } else {
            const [first, second] = rule.tolerances;
            const lower = Math.min(first, second) - 1e-4;
            const upper = Math.max(first, second) + 1e-4;
            const diff = actual - Number(rule.expected);

            passed = diff >= lower && diff <= upper;
          }

          results.push({ rule, actual, passed });
        }

        if (results.length) {
          const passed = results.every((r) => r.passed);
          const table = results.map(({ rule, actual, passed }) => ({
            time: `${rule.time}s`,
            channels: numberOfChannels,
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
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      const element = document.querySelector('p[name="message"]') as HTMLElement;

      if (element) {
        element.textContent = message;
      }
    } finally {
      await decoder.close();
    }
  }
});
