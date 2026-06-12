import { createEffect, createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import type { LoudnessStandard } from "#components";
import { LoudnessChart, LoudnessStandardSelector, STANDARDS } from "#components";
import { createLoudnessAnalysis } from "#hooks";
import { AudioLinesIcon, FileSlidersIcon, PanelRightCloseIcon } from "#icons";
import { formatChannels, formatFileSize, formatTime } from "#utils";

type Props = {
  files: FileList;
};

function Dashboard(props: Props) {
  const id = createUniqueId();
  const { analyze, clear, getSnapshots, getMeasurements } = createLoudnessAnalysis();
  const [getFile, setFile] = createSignal<File>();
  const [getBuffer, setBuffer] = createSignal<AudioBuffer>();
  const [getTarget, setTarget] = createSignal<LoudnessStandard>(STANDARDS[0]);
  const getProgress = createMemo(handleProgressChange);
  const getFiles = createMemo(() => Array.from(props.files));

  function handleProgressChange() {
    const buffer = getBuffer();
    const snapshots = getSnapshots();

    if (!buffer || !snapshots || !snapshots.length) return 0;

    const snapshot = snapshots.at(-1);

    if (!snapshot) return 0;

    const { duration } = buffer;
    const { currentTime } = snapshot;

    if (duration - currentTime <= 0.15) {
      return 100;
    }

    const progress = Math.min(Math.ceil((currentTime / duration) * 100), 100);

    return progress;
  }

  function handleFileSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const file = getFiles().find((f) => f.name === select.value);

    if (file) {
      handleFileChange(file);
    }
  }

  function handleFileChange(file: File) {
    const reader = new FileReader();

    reader.onload = handleFileLoad;
    reader.readAsArrayBuffer(file);

    document.startViewTransition(() => setFile(file));
  }

  async function handleFileLoad(event: ProgressEvent<FileReader>) {
    try {
      const target = event.target as FileReader;
      const arrayBuffer = target.result as ArrayBuffer;
      const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);

      setBuffer(audioBuffer);
    } catch (_error) {
      alert("Error decoding file. Please try a different file or browser.");
    }
  }

  createEffect(() => {
    const [file] = getFiles();

    if (file) {
      handleFileChange(file);
    }
  });

  createEffect(() => {
    const buffer = getBuffer();

    if (!buffer) return;

    clear();
    analyze(buffer, { interval: 0.1 });
  });

  return (
    <div class="bg-base-100 flex h-dvh min-h-0 w-dvw flex-col overflow-hidden tabular-nums">
      <div class="drawer lg:drawer-open lg:drawer-end flex min-h-0 flex-1 overflow-hidden">
        <input class="drawer-toggle" id={id} type="checkbox" />

        <div class="drawer-content flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav class="navbar border-base-300 bg-base-100 min-h-fit border-b px-4 py-2">
            <div class="navbar-start">
              <a class="btn btn-sm btn-ghost" href={__HOME_PAGE__}>
                Loudness Worklet
              </a>
            </div>
            <div class="navbar-end">
              <label class="btn btn-sm drawer-button btn-square btn-ghost lg:hidden" for={id}>
                <PanelRightCloseIcon size={16} />
              </label>
            </div>
          </nav>

          <div class="flex flex-1 flex-col gap-4 p-4">
            <header class="flex items-center justify-between gap-3">
              <div class="badge badge-soft gap-2 text-xs">
                <FileSlidersIcon size={14} />
                <select
                  class="w-fit max-w-32 cursor-pointer appearance-none truncate bg-transparent outline-0 select-none"
                  disabled={getProgress() < 99}
                  onchange={handleFileSelect}
                >
                  <Show fallback={<option>-</option>} keyed={true} when={getFiles()}>
                    {(files) => (
                      <For each={files}>
                        {(file) => <option value={file.name}>{file.name}</option>}
                      </For>
                    )}
                  </Show>
                </select>
              </div>
              <LoudnessStandardSelector default={getTarget()} onselect={setTarget} size="xs" />
            </header>

            <main class="flex flex-1 flex-col">
              <LoudnessChart snapshots={getSnapshots()} standard={getTarget()} />
            </main>
          </div>
        </div>

        <aside class="drawer-side">
          <label aria-label="close sidebar" class="drawer-overlay" for={id} />
          <div class="border-base-300 bg-base-200 min-h-full w-xs overflow-y-auto border">
            <section class="flex flex-col gap-4 p-4">
              <Show keyed when={getFile()}>
                {(file) => {
                  const { name, type, size } = file;

                  return (
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <div class="avatar bg-base-300 rounded-md p-2">
                          <AudioLinesIcon size={20} />
                        </div>

                        <div class="min-w-0">
                          <h3 class="truncate text-xs font-bold">{name}</h3>
                          <p class="text-base-content/70 space-x-1 text-xs font-light">
                            <span>{type}</span>
                            <span>&middot;</span>
                            <span>{formatFileSize(size)}</span>
                          </p>
                        </div>
                      </div>

                      <progress
                        class="progress progress-success h-1.5"
                        max={100}
                        value={getProgress()}
                      />
                    </div>
                  );
                }}
              </Show>

              <div class="divider text-xs tracking-wider uppercase">properties</div>

              <Show keyed when={getBuffer()}>
                {(buffer) => {
                  const { numberOfChannels: channels } = buffer;
                  const { duration, sampleRate, length } = buffer;

                  const audioInfos = [
                    { key: "duration", value: formatTime(duration) },
                    { key: "channels", value: formatChannels(channels) },
                    { key: "sample rate", value: `${sampleRate} Hz` },
                    { key: "length", value: length.toLocaleString() },
                  ];

                  return (
                    <div class="grid grid-cols-2 gap-1 text-xs">
                      <For each={audioInfos}>
                        {({ key, value }) => (
                          <>
                            <p class="text-base-content/70 font-light tracking-wider uppercase">
                              {key}
                            </p>
                            <p class="text-end font-mono tracking-wider">{value}</p>
                          </>
                        )}
                      </For>
                    </div>
                  );
                }}
              </Show>

              <div class="divider text-xs tracking-wider uppercase">loudness</div>

              <Show keyed when={getMeasurements()}>
                {(measurements) => {
                  const { integratedLoudness: i } = measurements;
                  const { maximumMomentaryLoudness: m } = measurements;
                  const { maximumShortTermLoudness: s } = measurements;
                  const { maximumTruePeakLevel: tp } = measurements;
                  const { loudnessRange: lra } = measurements;

                  return (
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-col gap-2">
                        <div class="rounded-box bg-base-100 p-2 shadow">
                          <div class="stat-title tracking-wider uppercase">integrated loudness</div>
                          <div class="stat-value text-primary font-light">
                            {i.toFixed(2)} <span class="stat-desc">LUFS</span>
                          </div>
                          <Show keyed when={getTarget()}>
                            {(target) => {
                              const diff = i - target.i;
                              const absDiff = Math.abs(diff);
                              const isLoud = diff > 0;
                              const isClose = absDiff <= 1.0;

                              return (
                                <div
                                  class="stat-desc"
                                  classList={{
                                    "text-success": isClose,
                                    "text-warning": !isClose && !isLoud,
                                    "text-error": !isClose && isLoud,
                                  }}
                                >
                                  Results are{" "}
                                  {isClose
                                    ? "within 1 LU of"
                                    : isLoud
                                      ? `${absDiff.toFixed(2)} LU louder than`
                                      : `${absDiff.toFixed(2)} LU quieter than`}{" "}
                                  the target.
                                </div>
                              );
                            }}
                          </Show>
                        </div>

                        <For
                          each={[
                            { key: "Max Momentary Loudness", value: m },
                            { key: "Max Short-Term Loudness", value: s },
                          ]}
                        >
                          {({ key, value }) => (
                            <div class="flex items-center justify-between">
                              <p class="stat-title">{key}</p>
                              <p class="stat-value text-xs font-light">
                                {value.toFixed(2)}
                                <span class="stat-desc ml-1">LUFS</span>
                              </p>
                            </div>
                          )}
                        </For>
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <div class="rounded-box bg-base-100 flex flex-col gap-1 p-2 shadow">
                          <div class="stat-title tracking-wider text-pretty uppercase">
                            loudness range
                          </div>
                          <div
                            class="stat-value text-lg font-light"
                            classList={{ "text-warning": lra > 20 }}
                          >
                            {lra.toFixed(2)}
                            <span class="stat-desc ml-1">LU</span>
                          </div>
                        </div>
                        <div class="rounded-box bg-base-100 flex flex-col gap-1 p-2 shadow">
                          <div class="stat-title tracking-wider text-pretty uppercase">
                            true peak
                          </div>
                          <Show keyed when={getTarget()}>
                            {(target) => {
                              return (
                                <div
                                  class="stat-value text-lg font-light"
                                  classList={{
                                    "text-error": tp > target.tp,
                                  }}
                                >
                                  {tp.toFixed(2)}
                                  <span class="stat-desc ml-1">dBTP</span>
                                </div>
                              );
                            }}
                          </Show>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </Show>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { Dashboard };
