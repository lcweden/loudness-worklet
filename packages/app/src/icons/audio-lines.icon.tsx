import { mergeProps } from "solid-js";
import type { IconProps } from "#icons";

function AudioLinesIcon(props: IconProps) {
  const merge = mergeProps({ size: 20, strokeWidth: 1.75 }, props);

  return (
    <svg
      class="lucide lucide-audio-lines-icon lucide-audio-lines"
      fill="none"
      height={merge.size}
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={merge.strokeWidth}
      viewBox="0 0 24 24"
      width={merge.size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Icon</title>
      <path d="M2 10v3" />
      <path d="M6 6v11" />
      <path d="M10 3v18" />
      <path d="M14 8v7" />
      <path d="M18 5v13" />
      <path d="M22 10v3" />
    </svg>
  );
}

export { AudioLinesIcon };
