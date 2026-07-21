<script lang="ts">
  import github from "@assets/github-mark-white.svg";
  import Drawer from "@components/drawer.svelte";
  import Stat from "@components/stat.svelte";
  import AudioAnalyzer from "@hooks/analyzer.svelte";
  import Bars3 from "@icons/bars-3.icon.svelte";
  import Plus from "@icons/plus.icon.svelte";
  import { formatChannels, formatFileSize, formatTime } from "@utils/format";
  import { graphic, init } from "echarts";
  import { onMount } from "svelte";

  const analyzer = new AudioAnalyzer();
  let { data } = $props();
  let files = $state<FileList>();
  let file = $state<File>();
  let error = $state<Error>();
  let open = $state<boolean>(false);
  let fetching = $state<boolean>(false);
  let loading = $derived<boolean>(fetching || analyzer.processing);

  function oninput(event: Event): void {
    const target = event.target as HTMLInputElement;

    document.startViewTransition(() => {
      if (target.files) {
        files = target.files;
        file = files[0];
      }
    });
  }

  onMount(async () => {
    if (data.input) {
      fetching = true;

      try {
        const url = new URL(data.input);
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.pathname.split("/").pop() || "unknown";

        document.startViewTransition(() => {
          file = new File([blob], filename, { type: blob.type });
        });
      } catch (cause) {
        error = new Error("Failed to fetch file", { cause });
      } finally {
        fetching = false;
      }
    }
  });

  $effect(() => {
    if (file) {
      try {
        analyzer.render(file);
      } catch (cause) {
        error = new Error("Failed to analyze file", { cause });
      }
    }
  });
</script>

<Drawer bind:open>
  {#snippet content()}
    <div class="mx-auto flex h-full w-full flex-col gap-2 p-2 tabular-nums lg:container">
      <nav class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button class="btn btn-neutral btn-circle lg:hidden" onclick={() => (open = !open)}>
            <Bars3 />
          </button>

          <label class="btn btn-neutral btn-circle">
            <Plus />
            <input type="file" class="hidden" accept="audio/*,video/*" multiple {oninput} />
          </label>
        </div>
        <a
          class="btn btn-circle btn-ghost"
          href="https://github.com/lcweden/loudness-worklet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img class="size-8 opacity-85" src={github} alt="GitHub" />
        </a>
      </nav>

      <main class="flex-1">
        <div class="flex h-full w-full flex-col gap-2">
          {#if loading}
            <div class="flex h-full w-full flex-col items-center justify-center gap-2">
              <progress class="progress progress-primary w-56"></progress>
            </div>
          {:else if error}
            <div class="flex h-full w-full flex-col items-center justify-center gap-2">
              <p class="text-error">{error.message}</p>
            </div>
          {:else if file && analyzer.buffer}
            {@const name = file.name}
            {@const size = formatFileSize(file.size)}
            {@const type = file.type}
            {@const channels = formatChannels(analyzer.buffer.numberOfChannels)}
            {@const duration = formatTime(analyzer.buffer.duration)}
            {@const sampleRate = analyzer.buffer.sampleRate}

            <section class="flex max-w-full flex-col gap-1 p-2">
              <p class="text-base-content/75 text-xs">{type} • {size}</p>
              <h2 class="truncate text-2xl font-semibold">{name}</h2>
              <div class="flex items-center gap-1">
                <span class="badge badge-sm badge-soft badge-secondary">{channels}</span>
                <span class="badge badge-sm badge-soft badge-secondary">{duration}</span>
                <span class="badge badge-sm badge-soft badge-secondary">{sampleRate} Hz</span>
              </div>
            </section>

            <section class="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {#if analyzer.snapshot}
                {@const lufs = analyzer.snapshot.integratedLoudness.toFixed(1)}
                {@const lra = analyzer.snapshot.loudnessRange.toFixed(1)}
                {@const tp = analyzer.snapshot.maximumTruePeakLevel.toFixed(1)}
                {@const stats = [
                  {
                    title: "Loudness Range",
                    value: lra,
                    unit: "LU",
                    desc: "Dynamic contrast from quiet to loud",
                  },
                  {
                    title: "Integrated Loudness",
                    value: lufs,
                    unit: "LUFS",
                    desc: "Average loudness over time",
                  },
                  { title: "True Peak", value: tp, unit: "dBTP", desc: "Highest peak level" },
                ]}

                {#each stats as stat}
                  <Stat title={stat.title} value={stat.value} unit={stat.unit} desc={stat.desc} />
                {/each}
              {/if}
            </section>

            <section class="flex flex-1">
              <div
                class="h-full w-full"
                {@attach (element: HTMLDivElement) => {
                  const chart = init(element);
                  const style = window.getComputedStyle(document.documentElement);
                  const observer = new ResizeObserver(() => chart.resize());

                  const dataset = {
                    dimensions: ["time", "integrated", "shortterm", "momentary"],
                    source: analyzer.snapshots.map((s) => {
                      const transform = (value: number) =>
                        Number.isFinite(value) ? value.toFixed(1) : null;

                      return {
                        time: s.currentTime,
                        integrated: transform(s.integratedLoudness),
                        shortterm: transform(s.shortTermLoudness),
                        momentary: transform(s.momentaryLoudness),
                      };
                    }),
                  };

                  const tooltip = {
                    trigger: "axis",
                    confine: true,
                    axisPointer: { type: "cross" },
                    borderWidth: 1,
                    borderRadius: 8,
                    transitionDuration: 0,
                    backgroundColor: style.getPropertyValue("--color-base-200"),
                    borderColor: style.getPropertyValue("--color-base-300"),
                    textStyle: { color: style.getPropertyValue("--color-base-content") },
                  };

                  const legend = {
                    data: ["Integrated", "Short-Term", "Momentary"],
                    top: "5%",
                    icon: "roundRect",
                    itemWidth: 18,
                    itemGap: 14,
                    textStyle: {
                      color: style.getPropertyValue("--color-base-content"),
                      fontSize: 12,
                    },
                  };

                  const grid = {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: "10%",
                    containLabel: false,
                  };

                  const xAxis = {
                    type: "value",
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    splitLine: { show: false },
                  };

                  const yAxis = {
                    type: "value",
                    nameTextStyle: { color: style.getPropertyValue("--color-base-content") },
                    position: "right",
                    axisLabel: {
                      color: style.getPropertyValue("--color-base-content"),
                      opacity: 0.6,
                      inside: false,
                      margin: 0,
                    },
                    axisLine: { show: false },
                    splitLine: { show: false },
                  };

                  const dataZoom = [
                    { type: "inside", zoomOnMouseWheel: true, moveOnMouseMove: true },
                    {
                      type: "slider",
                      borderColor: "transparent",
                      realtime: true,
                      backgroundColor: "transparent",
                      fillerColor: "transparent",
                      dataBackground: {
                        lineStyle: { color: style.getPropertyValue("--color-primary") },
                        areaStyle: {
                          color: style.getPropertyValue("--color-primary"),
                          opacity: 0.2,
                        },
                      },
                      selectedDataBackground: {
                        lineStyle: { color: style.getPropertyValue("--color-primary") },
                        areaStyle: {
                          color: style.getPropertyValue("--color-primary"),
                          opacity: 0.6,
                        },
                      },
                      handleStyle: { color: style.getPropertyValue("--color-primary") },
                      moveHandleStyle: { color: style.getPropertyValue("--color-primary") },
                      textStyle: { color: style.getPropertyValue("--color-base-content") },
                    },
                  ];

                  const series = [
                    ["Integrated", "integrated", "--color-primary"],
                    ["Short-Term", "shortterm", "--color-secondary"],
                    ["Momentary", "momentary", "--color-accent"],
                  ].map(([name, y, property]) => ({
                    name,
                    type: "line",
                    encode: { x: "time", y },
                    smooth: true,
                    showSymbol: false,
                    lineStyle: { width: 1.5, color: style.getPropertyValue(property) },
                    itemStyle: { color: style.getPropertyValue(property) },
                    areaStyle: {
                      origin: "start",
                      opacity: 0.3,
                      color: new graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: style.getPropertyValue(property) },
                        { offset: 1, color: "transparent" },
                      ]),
                    },
                    connectNulls: false,
                    emphasis: { disabled: true },
                    blur: { lineStyle: { opacity: 1 } },
                  }));

                  observer.observe(element);
                  chart.setOption({
                    dataset,
                    tooltip,
                    legend,
                    grid,
                    xAxis,
                    yAxis,
                    dataZoom,
                    series,
                  });

                  return () => {
                    chart.dispose();
                    observer.disconnect();
                  };
                }}
              >
                <!-- Chart -->
              </div>
            </section>
          {:else}
            <article class="hero flex-1">
              <div class="hero-content text-center">
                <div class="max-w-md space-y-6 sm:max-w-lg">
                  <a
                    class="btn btn-sm space-x-2 rounded-full"
                    href="https://www.npmjs.com/package/loudness-worklet"
                    target="_blank"
                  >
                    <span class="status status-info"></span>
                    <p class="text-base-content font-mono font-light">
                      npm install loudness-worklet
                    </p>
                  </a>
                  <div>
                    <h1
                      class="from-primary to-accent bg-linear-to-r bg-clip-text text-4xl font-bold text-transparent md:text-6xl"
                    >
                      Audio Loudness Measurement
                    </h1>
                    <h2 class="text-base-content/80 text-lg font-medium md:text-xl">
                      Loudness Meter for the Web Audio API
                    </h2>
                  </div>
                  <p
                    class="text-base-content/70 md:text-md mx-auto max-w-xl text-sm leading-relaxed"
                  >
                    A lightweight, browser-based loudness meter providing real-time LUFS, LRA, and
                    true-peak analysis. Validated with official ITU-R BS.2217 and EBU Tech 3341/3342
                    test suites.
                  </p>

                  <div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
                    <label class="btn btn-wide btn-primary">
                      <Plus />
                      Select Files
                      <input type="file" class="hidden" accept="audio/*,video/*" multiple {oninput} />
                    </label>
                    <a
                      class="btn btn-wide btn-neutral"
                      href="https://github.com/lcweden/loudness-worklet"
                      target="_blank"
                    >
                      <img alt="GitHub Logo" class="h-5 w-5" src={github} />
                      See Documentation
                    </a>
                  </div>

                  <span class="text-rotate text-xs">
                    <span class="justify-items-center">
                      <span>Standards Compliant</span>
                      <span>Comprehensive Metrics</span>
                      <span>Flexible Input Sources</span>
                      <span>Zero Dependencies</span>
                    </span>
                  </span>
                </div>
              </div>
            </article>
          {/if}
        </div>
      </main>
    </div>
  {/snippet}

  {#snippet sidebar()}
    <aside class="flex h-full min-h-0 w-xs flex-col p-2">
      <ul class="menu bg-base-200 rounded-box w-full flex-1 flex-nowrap overflow-y-auto">
        <li class="p-4 pb-2 tracking-wide opacity-60">Selected Files</li>
        {#each files as f}
          <li class="text-base-content/75">
            <button
              class="w-full min-w-0 text-left"
              class:menu-active={f === file}
              disabled={analyzer.processing}
              onclick={() => document.startViewTransition(() => (file = f))}
            >
              <span class="block truncate">{f.name}</span>
            </button>
          </li>
        {:else}
          <li class="menu-disabled">
            <span class="text-base-content/50 block truncate">No files selected</span>
          </li>
        {/each}
      </ul>
    </aside>
  {/snippet}
</Drawer>
