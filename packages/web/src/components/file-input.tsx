import { createUniqueId, type JSX } from "solid-js";

type FileInputProps = {
  children: JSX.Element;
  class?: string;
  accept?: string;
  disabled?: boolean;
  multiple?: boolean;
  oninput?: (files: FileList) => void;
};

function FileInput(props: FileInputProps) {
  const id = createUniqueId();

  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && props.oninput) {
      props.oninput(files);
    }
  }

  return (
    <label class={props.class} for={id}>
      {props.children}
      <input
        accept={props.accept}
        class="hidden"
        disabled={props.disabled}
        id={id}
        multiple={props.multiple}
        onchange={handleChange}
        type="file"
      />
    </label>
  );
}

export { FileInput };
export type { FileInputProps };
