import { For } from "solid-js";

type LoudnessStandard = {
  label: string;
  category: "Broadcast" | "Music";
  i: number;
  tp: number;
};

type LoudnessStandardSelectorProps = {
  size: "xs" | "sm" | "md" | "lg";
  default: LoudnessStandard;
  onselect?: (standard: LoudnessStandard) => void;
};

const CATEGORIES = ["Broadcast", "Music"] as const;

const STANDARDS: LoudnessStandard[] = [
  { label: "EBU R128", category: CATEGORIES[0], i: -23, tp: -1.0 },
  { label: "ATSC A/85", category: CATEGORIES[0], i: -24, tp: -1.0 },
  { label: "Netflix", category: CATEGORIES[0], i: -27, tp: -2.0 },
  { label: "Spotify", category: CATEGORIES[1], i: -14, tp: -1.0 },
  { label: "Apple Music", category: CATEGORIES[1], i: -16, tp: -1.0 },
] as const;

function LoudnessStandardSelector(props: LoudnessStandardSelectorProps) {
  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const { value } = select;
    const standard = STANDARDS.find((s) => s.label === value);

    if (standard && props.onselect) {
      props.onselect(standard);
    }
  }

  return (
    <select
      class="select w-fit min-w-28 cursor-pointer outline-0"
      classList={{
        "select-xs": props.size === "xs",
        "select-sm": props.size === "sm",
        "select-md": props.size === "md",
        "select-lg": props.size === "lg",
      }}
      onchange={handleChange}
      value={props.default.label}
    >
      <For each={CATEGORIES}>
        {(category) => (
          <optgroup label={category}>
            <For each={STANDARDS.filter((s) => s.category === category)}>
              {(standard) => (
                <option value={standard.label}>{standard.label}</option>
              )}
            </For>
          </optgroup>
        )}
      </For>
    </select>
  );
}

export { LoudnessStandardSelector, STANDARDS };
export type { LoudnessStandardSelectorProps, LoudnessStandard };
