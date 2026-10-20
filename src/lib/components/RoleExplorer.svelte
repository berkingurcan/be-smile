<script lang="ts">
  import { tick } from 'svelte';
  import { copy } from '../content';
  import { editorial } from '../editorial';
  import type { Locale } from '../site';
  import RoleIcon from './RoleIcon.svelte';
  let { lang, onchoose }: { lang: Locale; onchoose: (index: number) => void } = $props();
  const t = $derived(copy[lang]);
  const e = $derived(editorial[lang]);
  let expanded = $state(false);
  let step = $state(0);
  let interest = $state<number | null>(null);
  let experience = $state<number | null>(null);
  let heading = $state<HTMLHeadingElement>();
  async function move(next: number) { step = next; await tick(); heading?.focus({preventScroll:true}); }
  async function toggle() { expanded = !expanded; if(expanded) { await tick(); heading?.focus({preventScroll:true}); } }
</script>
<div class="role-finder">
  <div class="finder-invitation"><div><span class="section-number">↗</span><div><p class="eyebrow">{e.finderLabel}</p><h3>{e.finderTitle.replace('\n',' ')}</h3><p>{e.finderIntro}</p></div></div><button class="button outline" type="button" aria-expanded={expanded} aria-controls="role-guide" onclick={toggle}>{expanded ? e.finderClose : e.finderStart}<span aria-hidden="true">{expanded ? '−' : '+'}</span></button></div>
  {#if expanded}
    <div class="finder-content" id="role-guide">
      <div class="finder-progress" aria-hidden="true"><span class:complete={step >= 0}>01</span><i class:complete={step >= 1}></i><span class:complete={step >= 1}>02</span><i class:complete={step === 2}></i><span class:complete={step === 2}>↗</span></div>
      {#if step < 2}
        <h4 bind:this={heading} tabindex="-1">{step === 0 ? e.interest : e.experience}</h4>
        <fieldset class="finder-options"><legend class="sr-only">{step === 0 ? e.interest : e.experience}</legend>
          {#each (step === 0 ? e.interests : e.experiences) as choice,i}
            <label class:choice-selected={(step === 0 ? interest : experience) === i}><input type="radio" name={step === 0 ? 'finder-interest' : 'finder-experience'} value={i} checked={(step === 0 ? interest : experience) === i} onchange={() => { if(step === 0) interest = i; else experience = i; }}/>{#if step === 0}<RoleIcon kind={t.roles[i].icon} size={26}/>{:else}<span class="choice-index" aria-hidden="true">0{i+1}</span>{/if}<span>{choice}</span><span class="choice-marker" aria-hidden="true">{(step === 0 ? interest : experience) === i ? '✓' : '+'}</span></label>
          {/each}
        </fieldset>
        <div class="finder-actions">{#if step === 1}<button class="quiet-link" type="button" onclick={() => move(0)}>← {e.back}</button>{/if}<button class="button dark" type="button" disabled={(step === 0 ? interest : experience) === null} onclick={() => move(step + 1)}>{step === 0 ? e.next : e.seeResult}<span aria-hidden="true">↗</span></button></div>
      {:else if interest !== null && experience !== null}
        <div class="finder-result"><div class="result-symbol"><RoleIcon kind={t.roles[interest].icon} size={48}/></div><div><p class="eyebrow">{e.resultLabel}</p><h4 bind:this={heading} tabindex="-1">{t.roles[interest].type}</h4><p>{e.experienceNotes[experience]}</p><p class="result-note">{e.resultNote}</p><div class="finder-actions"><button class="button dark" type="button" onclick={() => { if(interest !== null) onchoose(interest); }}>{e.viewRole}<span aria-hidden="true">↓</span></button><button class="quiet-link" type="button" onclick={() => { interest = null; experience = null; move(0); }}>{e.restart} ↺</button></div></div></div>
      {/if}
    </div>
  {/if}
</div>
