<script lang="ts">
  import { localePath, type Locale } from '../site';
  let { lang, label }: { lang: Locale; label: string } = $props();
  let open = $state(false);
  let trigger = $state<HTMLElement>();
  const languages: { code: Locale; name: string }[] = [{code:'ru',name:'Русский'},{code:'tr',name:'Türkçe'},{code:'de',name:'Deutsch'},{code:'en',name:'English'}];
  function outside(event: MouseEvent) {
    if (!(event.target instanceof Element) || !event.target.closest('.language-picker')) open = false;
  }
</script>
<svelte:window onclick={outside} onkeydown={(event) => { if (event.key === 'Escape' && open) { open = false; trigger?.focus(); } }}/>
<details class="language-picker" bind:open>
  <summary bind:this={trigger} aria-label={label}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>{lang.toUpperCase()}</span><span class="language-chevron" aria-hidden="true">⌄</span></summary>
  <nav class="language-menu" aria-label={label}>{#each languages as language}<a href={localePath(language.code)} lang={language.code} hreflang={language.code} aria-current={lang === language.code ? 'page' : undefined}><span>{language.name}</span><span aria-hidden="true">{lang === language.code ? '✓' : '↗'}</span></a>{/each}</nav>
</details>
