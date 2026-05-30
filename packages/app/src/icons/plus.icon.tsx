import { mergeProps } from "solid-js";
import type { IconProps } from "#icons";

function PlusIcon(props: IconProps) {
  const merge = mergeProps({ size: 20, strokeWidth: 1.75 }, props);

  return (
    <svg
      class="lucide lucide-plus-icon lucide-plus"
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export { PlusIcon };
