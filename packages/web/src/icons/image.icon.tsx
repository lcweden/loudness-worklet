import { mergeProps } from "solid-js";
import type { IconProps } from "#icons";

function ImageIcon(props: IconProps) {
  const merge = mergeProps({ size: 20, strokeWidth: 1.75 }, props);

  return (
    <svg
      class="lucide lucide-image-icon lucide-image"
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
      <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export { ImageIcon };
