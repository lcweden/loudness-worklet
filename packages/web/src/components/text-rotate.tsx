import { For } from "solid-js";

type TextRotateProps = {
  spans: string[];
};

function TextRotate(props: TextRotateProps) {
  return (
    <span class="select-none text-rotate text-xs">
      <span>
        <For each={props.spans}>{(span) => <span>{span}</span>}</For>
      </span>
    </span>
  );
}

export { TextRotate };
export type { TextRotateProps };
