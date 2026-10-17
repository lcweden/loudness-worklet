<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    open?: boolean;
    content?: Snippet;
    sidebar?: Snippet;
  }

  let { open: checked = $bindable(false), content, sidebar }: Props = $props();
  let id = $props.id();
</script>

<div class="drawer lg:drawer-open h-dvh">
  <input bind:checked {id} type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    {#if content}
      {@render content()}
    {/if}
  </div>
  <div class="drawer-side">
    <label aria-label="close sidebar" class="drawer-overlay" for={id}></label>
    {#if sidebar}
      {@render sidebar()}
    {/if}
  </div>
</div>
