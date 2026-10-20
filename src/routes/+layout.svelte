<script lang="ts">
  import '@fontsource-variable/manrope';
  import '@fontsource-variable/golos-text';
  import '../app.css';
  import '../refinement.css';
  import '../editorial.css';
  import { onMount } from 'svelte';
  import { base } from '../lib/site';
  onMount(() => {
    if ('serviceWorker' in navigator && !import.meta.env.DEV) {
      navigator.serviceWorker.register(`${base}/service-worker.js`, {scope:`${base}/`}).catch(() => {});
    }
  });
  let { children } = $props();
</script>
<svelte:head>
  <link rel="manifest" href={`${base}/manifest.webmanifest`}/>
</svelte:head>
{@render children()}
