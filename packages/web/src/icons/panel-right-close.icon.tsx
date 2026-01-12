import { mergeProps } from "solid-js";
import type { IconProps } from "#icons";

function PanelRightCloseIcon(props: IconProps) {
  const merge = mergeProps({ size: 20, strokeWidth: 1.75 }, props);

  return (
    <svg
      class="lucide lucide-panel-right-close-icon lucide-panel-right-close"
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
      <rect height="18" rx="2" width="18" x="3" y="3" />
      <path d="M15 3v18" />
      <path d="m8 9 3 3-3 3" />
    </svg>
  );
}

export { PanelRightCloseIcon };
