import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  Show,
} from "solid-js";
import type { LoudnessStandard } from "#components";
import {
  LoudnessChart,
  LoudnessStandardSelector,
  STANDARDS,
} from "#components";
import { createLoudnessAnalysis } from "#hooks";
import { AudioLinesIcon, FileSlidersIcon, PanelRightCloseIcon } from "#icons";
import { formatChannels, formatFileSize, formatTime } from "#utils";

type Props = {
  files: FileList;
};

function Dashboard(props: Props) {
  const id = createUniqueId();
  const { analyze, clear, getSnapshots, getMeasurements } =
    createLoudnessAnalysis();
  const [getFile, setFile] = createSignal<File>();
  const [getBuffer, setBuffer] = createSignal<AudioBuffer>();
  const [getTarget, setTarget] = createSignal<LoudnessStandard>(STANDARDS[0]);
  const getProgress = createMemo(handleProgressChange);

  function handleProgressChange() {
    const buffer = getBuffer();
    const snapshots = getSnapshots();

    if (!buffer || !snapshots || !snapshots.length) return 0;

    const snapshot = snapshots.at(-1);

    if (!snapshot) return 0;

    const { duration } = buffer;
    const { currentTime } = snapshot;
    const progress = Math.min(Math.ceil((currentTime / duration) * 100), 100);

    return progress;
  }

  function handleFileSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const file = Array.from(props.files).find((f) => f.name === select.value);
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
    const [file] = props.files;
    handleFileChange(file);
  });

  createEffect(() => {
    const buffer = getBuffer();

    if (!buffer) return;

    clear();
    analyze(buffer);
  });

  return (
    <div class="flex h-dvh min-h-0 w-dvw flex-col overflow-hidden bg-base-100 tabular-nums">
      <div class="drawer lg:drawer-open lg:drawer-end flex min-h-0 flex-1 overflow-hidden">
        <input class="drawer-toggle" id={id} type="checkbox" />

        <div class="drawer-content flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav class="navbar min-h-fit border-base-300 border-b bg-base-100 px-4 py-2">
            <div class="navbar-start">
              <a class="btn btn-sm btn-ghost" href={__HOME_PAGE__}>
                Loudness Worklet
              </a>
            </div>
            <div class="navbar-end">
              <label
                class="btn btn-sm drawer-button btn-square btn-ghost lg:hidden"
                for={id}
              >
                <PanelRightCloseIcon size={16} />
              </label>
            </div>
          </nav>

          <div class="flex flex-1 flex-col gap-4 p-4">
            <header class="flex items-center justify-between gap-3">
              <div class="badge badge-soft gap-2 text-xs">
                <FileSlidersIcon size={14} />
                <select
                  class="w-fit max-w-32 cursor-pointer select-none appearance-none truncate bg-transparent outline-0"
                  disabled={getProgress() < 99}
                  onchange={handleFileSelect}
                >
                  <Show
                    fallback={<option>-</option>}
                    keyed={true}
                    when={props.files}
                  >
                    {(files) => (
                      <For each={Array.from(files)}>
                        {(file) => (
                          <option value={file.name}>{file.name}</option>
                        )}
                      </For>
                    )}
                  </Show>
                </select>
              </div>
              <LoudnessStandardSelector
                default={getTarget()}
                onselect={setTarget}
                size="xs"
              />
            </header>

            <main class="flex flex-1 flex-col">
              <LoudnessChart
                snapshots={getSnapshots()}
                standard={getTarget()}
              />
            </main>
          </div>
        </div>

        <aside class="drawer-side">
          <label aria-label="close sidebar" class="drawer-overlay" for={id} />
          <div class="min-h-full w-xs overflow-y-auto border border-base-300 bg-base-200">
            <section class="flex flex-col gap-4 p-4">
              <Show keyed when={getFile()}>
                {(file) => {
                  const { name, type, size } = file;

                  return (
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <div class="avatar rounded-md bg-base-300 p-2">
                          <AudioLinesIcon size={20} />
                        </div>

                        <div class="min-w-0">
                          <h3 class="truncate font-bold text-xs">{name}</h3>
                          <p class="space-x-1 font-light text-base-content/70 text-xs">
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

              <div class="divider text-xs uppercase tracking-wider">
                properties
              </div>

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
                            <p class="font-light text-base-content/70 uppercase tracking-wider">
                              {key}
                            </p>
                            <p class="text-end font-mono tracking-wider">
                              {value}
                            </p>
                          </>
                        )}
                      </For>
                    </div>
                  );
                }}
              </Show>

              <div class="divider text-xs uppercase tracking-wider">
                loudness
              </div>

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
                          <div class="stat-title uppercase">
                            integrated loudness
                          </div>
                          <div class="stat-value font-light text-primary">
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
                              <p class="stat-value font-light text-xs">
                                {value.toFixed(2)}
                                <span class="stat-desc ml-1">LUFS</span>
                              </p>
                            </div>
                          )}
                        </For>
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <div class="flex flex-col gap-1 rounded-box bg-base-100 p-2 shadow">
                          <div class="stat-title text-pretty uppercase">
                            loudness range
                          </div>
                          <div
                            class="stat-value font-light text-lg"
                            classList={{ "text-warning": lra > 20 }}
                          >
                            {lra.toFixed(2)}
                            <span class="stat-desc ml-1">LU</span>
                          </div>
                        </div>
                        <div class="flex flex-col gap-1 rounded-box bg-base-100 p-2 shadow">
                          <div class="stat-title text-pretty uppercase">
                            true peak
                          </div>
                          <Show keyed when={getTarget()}>
                            {(target) => {
                              return (
                                <div
                                  class="stat-value font-light text-lg"
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
