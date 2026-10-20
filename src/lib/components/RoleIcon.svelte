<script lang="ts">let { kind, size = 48 }: {kind:string;size?:number} = $props();</script>
<svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if kind === 'move'}
    <circle cx="40" cy="12" r="5"/><path d="m12 28 15-7 14 9 12-3M27 21l-5 19 16 4-7 14M22 40 9 52M41 30l-6 12"/>
  {:else if kind === 'play'}
    <path d="M32 12C19-1 7 13 18 25 1 28 8 47 23 43c-3 17 18 18 18 2 15 10 28-8 13-17C71 14 48 2 42 20 39 14 36 12 32 12Z"/><circle cx="33" cy="32" r="9"/><path d="M29 33q4 5 8 0"/>
  {:else if kind === 'music'}
    <path d="M25 43V15l27-6v29M25 23l27-6"/><ellipse cx="17" cy="46" rx="8" ry="6" transform="rotate(-20 17 46)"/><ellipse cx="44" cy="41" rx="8" ry="6" transform="rotate(-20 44 41)"/><path d="m9 11 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z"/>
  {:else if kind === 'host'}
    <rect x="24" y="6" width="16" height="31" rx="8"/><path d="M16 28v3a16 16 0 0 0 32 0v-3M32 47v11M23 58h18M28 14h8M28 21h8"/>
  {:else if kind === 'sun'}
    <circle cx="32" cy="32" r="14"/><path d="M32 3v8M32 53v8M3 32h8M53 32h8M11 11l6 6M47 47l6 6M11 53l6-6M47 17l6-6M26 35q6 8 12 0"/>
  {:else if kind === 'people'}
    <circle cx="23" cy="22" r="9"/><circle cx="45" cy="25" r="7"/><path d="M6 54v-4a17 17 0 0 1 34 0v4M43 40a12 12 0 0 1 15 12v2"/>
  {:else if kind === 'wave'}
    <path d="M4 26q7-10 14 0t14 0 14 0 14 0M4 38q7-10 14 0t14 0 14 0 14 0M4 50q7-10 14 0t14 0 14 0 14 0"/><circle cx="45" cy="12" r="6"/>
  {:else}
    <rect x="10" y="17" width="44" height="36" rx="5"/><path d="M23 17V9h18v8M10 31h44M26 30v6h12v-6M19 53v5M45 53v5"/>
  {/if}
</svg>
