<script lang="ts">
  let { size = "sm" } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
  class:size-4={size === "xs"}
  class:size-5={size === "sm"}
  class:size-6={size === "md"}
  class:size-7={size === "lg"}
  class:size-8={size === "xl"}
  class:size-9={size === "2xl"}
  class:size-10={size === "3xl"}
  class:size-11={size === "4xl"}
  class:size-12={size === "5xl"}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
  />
</svg>
