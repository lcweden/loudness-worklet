import type { LoudnessSnapshot } from "@loudness-worklet/lib";
import type {
  DataZoomComponentOption,
  ECharts,
  EChartsOption,
  GridComponentOption,
  LegendComponentOption,
  SeriesOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from "echarts";
import { graphic, init } from "echarts";
import { createEffect, createMemo, onCleanup, onMount } from "solid-js";
import type { LoudnessStandard } from "#components";
import { createTheme } from "#hooks";

type LoudnessChartProps = {
  snapshots: LoudnessSnapshot[];
  standard: LoudnessStandard;
};

function LoudnessChart(props: LoudnessChartProps) {
  const { colors } = createTheme();
  const getOptions = createMemo<EChartsOption>(handleOptionChange);
  const iton = (v: number) => (v === Number.NEGATIVE_INFINITY ? null : v);
  let canvas: HTMLDivElement;
  let chart: ECharts;

  function handleRef(element: HTMLDivElement) {
    canvas = element;
  }

  function handleChartResize() {
    if (chart) {
      chart.resize();
    }
  }

  function handleOptionChange() {
    const tooltip: TooltipComponentOption = {
      trigger: "axis",
      confine: true,
      axisPointer: {
        type: "cross",
        shadowStyle: { color: colors.baseContent, opacity: 0.1 },
      },
      borderWidth: 1,
      borderRadius: 8,
      transitionDuration: 0,
      backgroundColor: colors.base200,
      borderColor: colors.base300,
      textStyle: { color: colors.baseContent },
      valueFormatter: (value) =>
        typeof value === "number" ? `${value.toFixed(2)} LUFS` : "N/A",
    };

    const legend: LegendComponentOption = {
      data: ["Integrated", "Short-term", "Momentary"],
      top: 0,
      icon: "roundRect",
      itemWidth: 14,
      itemGap: 10,
      textStyle: { color: colors.baseContent, fontSize: 10 },
    };

    const grid: GridComponentOption = {
      left: "5%",
      right: "5%",
      top: "10%",
      bottom: "15%",
      containLabel: false,
    };

    const xAxis: XAXisComponentOption = {
      type: "value",
      axisLabel: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
    };

    const yAxis: YAXisComponentOption = {
      type: "value",
      nameTextStyle: { color: colors.baseContent },
      position: "right",
      axisLabel: {
        color: colors.baseContent,
        opacity: 0.6,
        inside: true,
        margin: -30,
      },
      axisLine: { show: false },
      splitLine: { show: false },
      min: -70,
      max: 0,
    };

    const dataZoom: DataZoomComponentOption[] = [
      { type: "inside", zoomOnMouseWheel: true, moveOnMouseMove: true },
      {
        type: "slider",
        height: 25,
        bottom: 5,
        borderColor: "transparent",
        realtime: true,
        backgroundColor: colors.base100,
        fillerColor: "transparent",
        dataBackground: {
          lineStyle: { color: colors.primary },
          areaStyle: { color: colors.primary, opacity: 0.2 },
        },
        selectedDataBackground: {
          lineStyle: { color: colors.primary },
          areaStyle: { color: colors.primary, opacity: 0.6 },
        },
        handleStyle: { color: colors.primary },
        moveHandleStyle: { color: colors.primary },
        textStyle: { color: colors.baseContent },
      },
    ];

    const series: SeriesOption[] = [
      {
        name: "Integrated",
        type: "line",
        encode: { x: "t", y: "i" },
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: colors.primary },
        itemStyle: { color: colors.primary },
        areaStyle: {
          origin: "start",
          opacity: 0.3,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.primary },
            { offset: 1, color: "transparent" },
          ]),
        },
        connectNulls: false,
        emphasis: { disabled: true },
        blur: { lineStyle: { opacity: 1 } },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: {
            type: "dashed",
            width: 1,
            color: colors.baseContent,
            opacity: 0.5,
          },
          label: {
            show: true,
            position: "insideMiddleTop",
            formatter: props.standard.i.toFixed(0),
            color: colors.baseContent,
          },
          data: [{ name: "Target", yAxis: props.standard.i }],
        },
      },
      {
        name: "Short-term",
        type: "line",
        encode: { x: "t", y: "s" },
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: colors.secondary },
        itemStyle: { color: colors.secondary },
        areaStyle: {
          origin: "start",
          opacity: 0.3,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.secondary },
            { offset: 1, color: "transparent" },
          ]),
        },
        connectNulls: false,
        emphasis: { disabled: true },
        blur: { lineStyle: { opacity: 1 } },
      },
      {
        name: "Momentary",
        type: "line",
        encode: { x: "t", y: "m" },
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: colors.accent },
        itemStyle: { color: colors.accent },
        areaStyle: {
          origin: "start",
          opacity: 0.3,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.accent },
            { offset: 1, color: "transparent" },
          ]),
        },
        connectNulls: false,
        emphasis: { disabled: true },
        blur: { lineStyle: { opacity: 1 } },
      },
    ];

    return {
      tooltip,
      legend,
      grid,
      xAxis,
      yAxis,
      dataZoom,
      series,
    } satisfies EChartsOption;
  }

  createEffect(() => {
    const snapshots = props.snapshots;

    if (!chart) return;

    const source = snapshots.map((snapshot) => ({
      t: snapshot.currentTime,
      i: iton(snapshot.currentMeasurements[0].integratedLoudness),
      s: iton(snapshot.currentMeasurements[0].shortTermLoudness),
      m: iton(snapshot.currentMeasurements[0].momentaryLoudness),
    }));

    chart.setOption(
      { dataset: { dimensions: ["t", "i", "s", "m"], source } },
      { lazyUpdate: true, silent: true },
    );
  });

  createEffect(() => {
    const options = getOptions();

    if (!chart) return;

    chart.setOption(options);
  });

  onMount(() => {
    chart = init(canvas);
    chart.setOption(getOptions());

    window.addEventListener("resize", handleChartResize);
  });

  onCleanup(() => {
    chart.dispose();
    window.removeEventListener("resize", handleChartResize);
  });

  return <div class="h-full w-full" ref={handleRef} />;
}

export { LoudnessChart };
export type { LoudnessChartProps };
