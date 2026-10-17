<script lang="ts">
  interface Props {
    title: string;
    value: string | number;
    unit?: string;
    desc: string;
  }

  let { title, value, unit, desc }: Props = $props();
</script>

<div class="stats">
  <div class="stat border-neutral rounded-box border">
    <div class="stat-title">{title}</div>
    <div class="stat-value">
      {value}
      {#if unit}
        <span class="text-base-content/75 text-xs font-light">{unit}</span>
      {/if}
    </div>
    <div class="stat-desc">{desc}</div>
  </div>
</div>
