<script lang="ts">
  import "@routes/layout.css";
  import favicon from "@assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="theme-color" content="white" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="black" media="(prefers-color-scheme: dark)" />
</svelte:head>

<div class="min-h-dvh w-full">
  {@render children()}
</div>
