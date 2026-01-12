import { onMount } from "solid-js";
import { createStore } from "solid-js/store";

type Colors = {
  primary: string;
  primaryContent: string;
  secondary: string;
  secondaryContent: string;
  accent: string;
  accentContent: string;
  neutral: string;
  neutralContent: string;
  base100: string;
  base200: string;
  base300: string;
  baseContent: string;
  info: string;
  infoContent: string;
  success: string;
  successContent: string;
  warning: string;
  warningContent: string;
  error: string;
  errorContent: string;
};

type Radius = {
  box: string;
  field: string;
  selector: string;
};

function createTheme() {
  const [colors, setColors] = createStore<Colors>({} as Colors);
  const [radius, setRadius] = createStore<Radius>({} as Radius);

  onMount(() => {
    const style = getComputedStyle(document.documentElement);

    const color = {
      primary: style.getPropertyValue("--color-primary"),
      primaryContent: style.getPropertyValue("--color-primary-content"),
      secondary: style.getPropertyValue("--color-secondary"),
      secondaryContent: style.getPropertyValue("--color-secondary-content"),
      accent: style.getPropertyValue("--color-accent"),
      accentContent: style.getPropertyValue("--color-accent-content"),
      neutral: style.getPropertyValue("--color-neutral"),
      neutralContent: style.getPropertyValue("--color-neutral-content"),
      base100: style.getPropertyValue("--color-base-100"),
      base200: style.getPropertyValue("--color-base-200"),
      base300: style.getPropertyValue("--color-base-300"),
      baseContent: style.getPropertyValue("--color-base-content"),
      info: style.getPropertyValue("--color-info"),
      infoContent: style.getPropertyValue("--color-info-content"),
      success: style.getPropertyValue("--color-success"),
      successContent: style.getPropertyValue("--color-success-content"),
      warning: style.getPropertyValue("--color-warning"),
      warningContent: style.getPropertyValue("--color-warning-content"),
      error: style.getPropertyValue("--color-error"),
      errorContent: style.getPropertyValue("--color-error-content"),
    } satisfies Colors;

    const radius = {
      box: style.getPropertyValue("--radius-box"),
      field: style.getPropertyValue("--radius-field"),
      selector: style.getPropertyValue("--radius-selector"),
    } satisfies Radius;

    setColors(color);
    setRadius(radius);
  });

  return { colors, radius };
}

export { createTheme };
