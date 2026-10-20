<script lang="ts">
  import { copy } from '../content';
  import { editorial } from '../editorial';
  import { MAX_CV_BYTES, cvCopy } from '../cv';
  import { asset, base, localePath, type Locale } from '../site';
  import RoleIcon from './RoleIcon.svelte';
  import LanguagePicker from './LanguagePicker.svelte';
  import RoleExplorer from './RoleExplorer.svelte';
  import { onMount, tick } from 'svelte';
  let { lang = 'ru' }: {lang?:Locale} = $props();
  const t = $derived(copy[lang]);
  const e = $derived(editorial[lang]);
  const cvText = $derived(cvCopy[lang]);
  let cvFile: File | null = $state(null);
  let cvInput: HTMLInputElement;
  let cvError = $state('');
  let selectedRole = $state('');
  let sending = $state(false);
  let message = $state('');
  let applicationVisible = $state(false);
  let keyboardOpen = $state(false);
  let availability = $state<'checking' | 'open' | 'closed' | 'unknown'>(__DEMO_MODE__ ? 'closed' : 'checking');
  let errors = $state<Record<string, string>>({});
  let result: 'success' | 'error' | '' = $state('');
  let availabilityRequest: AbortController | undefined;
  const mobileLabels = $derived({tr:['İşler','Oteller için','Başvur'],ru:['Роли','Для отелей','В команду'],de:['Rollen','Für Hotels','Bewerben'],en:['Roles','For hotels','Apply']}[lang]);
  async function checkAvailability() {
    if (__DEMO_MODE__) { availability = 'closed'; return; }
    availabilityRequest?.abort();
    const controller = new AbortController(); availabilityRequest = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    availability = 'checking';
    try {
      const response = await fetch(`${base}/api/apply/`, {cache:'no-store', signal:controller.signal});
      if (!response.ok) throw new Error('Status unavailable');
      const body = await response.json();
      if (typeof body.available !== 'boolean') throw new Error('Invalid status');
      availability = body.available ? 'open' : 'closed';
    } catch { if(availabilityRequest === controller) availability = 'unknown'; }
    finally { clearTimeout(timeout); }
  }
  onMount(() => {
    checkAvailability();
    const observer = new IntersectionObserver(([entry]) => applicationVisible = entry.isIntersecting, {threshold:0});
    const panel = document.getElementById('apply'); if (panel) observer.observe(panel);
    const viewport = window.visualViewport;
    const resize = () => keyboardOpen = !!viewport && window.innerHeight - viewport.height > 150;
    viewport?.addEventListener('resize', resize);
    return () => { observer.disconnect(); viewport?.removeEventListener('resize', resize); availabilityRequest?.abort(); };
  });
  $effect(() => { document.documentElement.lang = lang; });
  async function exploreRole(index: number) {
    const details = document.getElementById(`role-details-${index}`) as HTMLDetailsElement | null;
    if (details) details.open = true;
    await tick();
    const summary = details?.querySelector('summary');
    summary?.focus({preventScroll:true});
    document.getElementById(`role-${index}`)?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  async function chooseRole(index: number) {
    selectedRole = String(index);
    await tick();
    document.getElementById('application-title')?.focus({preventScroll:true});
    document.getElementById('apply')?.scrollIntoView({block:'start', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  function selectCV(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0]; cvError = ''; cvFile = null;
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name) || file.size > MAX_CV_BYTES || file.size === 0) { cvError = cvText.error; input.value = ''; return; }
    cvFile = file;
  }
  function removeCV() { cvInput.value = ''; cvFile = null; cvError = ''; }
  function validateField(input: HTMLInputElement) {
    if (!['name','contact','consent'].includes(input.name)) return;
    const valid = input.name === 'consent' ? input.checked : input.checkValidity() && input.value.trim().length >= (input.name === 'name' ? 2 : 3);
    errors = {...errors, [input.name]: valid ? '' : e.errors[input.name as keyof typeof e.errors]};
  }
  async function apply(event: SubmitEvent) {
    event.preventDefault();
    if (availability !== 'open' || sending) return;
    const form = event.currentTarget as HTMLFormElement;
    for (const name of ['name','contact','consent']) validateField(form.elements.namedItem(name) as HTMLInputElement);
    const invalid = Object.keys(errors).find(key => errors[key]);
    if (invalid || cvError) {
      message = e.errorSummary; result = 'error';
      if (!invalid && cvError) {
        const disclosure = form.querySelector<HTMLDetailsElement>('.optional-cv');
        if (disclosure) disclosure.open = true;
        await tick();
      }
      (invalid ? form.elements.namedItem(invalid) as HTMLInputElement : cvInput)?.focus(); return;
    }
    message = ''; result = ''; sending = true;
    try {
      const data = new FormData(form); if (!cvFile) data.delete('cv');
      const response = await fetch(`${base}/api/apply/`, {method:'POST',body:data});
      const body = await response.json();
      if (!response.ok) {
        message = body.code === 'invalid_cv' || response.status === 413 ? cvText.error : response.status === 503 ? t.unavailable : response.status === 400 ? t.invalid : t.failure;
        if(response.status === 503) availability = 'closed'; result = 'error'; return;
      }
      if (body.ok !== true) throw new Error('Delivery not confirmed');
      message = t.success; result = 'success'; form.reset(); selectedRole = ''; cvFile = null; cvError = ''; errors = {};
    } catch { message = t.failure; result = 'error'; }
    finally { sending = false; }
  }
</script>

<svelte:head>
  <title>{t.title}</title><meta name="description" content={t.description}/>
  <meta property="og:title" content={t.title}/><meta property="og:description" content={t.description}/><meta property="og:type" content="website"/>
  <meta name="twitter:card" content="summary_large_image"/>
</svelte:head>

<div class="editorial-page">
<a class="skip-link" href="#main">{t.skip}</a>
<header class="site-header wrap">
  <a class="logo-link" href={localePath(lang)} aria-label="Be Smile"><img src={asset('/brand/logo-primary.svg')} alt="Be Smile" width="188" height="43"/></a>
  <nav class="header-nav" aria-label={e.crew}>
    <div class="audience-links"><a href="#roles" aria-current="page">{e.crew}</a><a href={asset('/hotels/')}>{e.hotels}<span aria-hidden="true">↗</span></a></div>
    <LanguagePicker {lang} label={e.language}/>
    <a href="#apply" class="button small dark header-apply">{t.apply}<span aria-hidden="true">↗</span></a>
  </nav>
</header>
<main id="main">
  <section class="recruit-hero wrap" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow"><span class="status-dot"></span>{t.eyebrow}</p>
      <h1 id="hero-title">{t.hero1}<br/><span>{t.hero2}</span></h1>
      <p class="hero-intro">{t.intro}</p>
      <div class="hero-actions"><a class="button dark" href="#roles">{t.heroCta}<span aria-hidden="true">↗</span></a><a href="#how" class="quiet-link">{t.heroSecondary}<span aria-hidden="true">↓</span></a></div>
      <p class="hero-note"><span aria-hidden="true">↳</span>{t.heroNote}</p>
    </div>
    <figure class="editorial-hero-art">
      <div class="hero-photo"><img src={asset('/images/good-energy-poster.svg')} alt={e.artAlt} width="800" height="1000" fetchpriority="high"/><div class="photo-topline"><span>BE SMILE / GOOD ENERGY</span><span>01</span></div></div>
      <div class="sun-seal" aria-hidden="true"><img src={asset('/brand/symbol-ink.svg')} alt="" width="82" height="82"/></div>
      <div class="chapter-ticket"><span class="ticket-label">{e.heroCaption}</span><span class="ticket-line"></span><span aria-hidden="true">↗</span></div>
      <figcaption><span>{e.artCaption}</span><span>{e.chapter}</span></figcaption>
    </figure>
    <div class="hero-footline"><span>{e.heroLabel}</span><a href="#roles">{e.scroll}<span aria-hidden="true">↓</span></a></div>
  </section>
  <div class="benefit-band"><div class="wrap benefit-inner">{#each t.benefits as benefit,i}<div><RoleIcon kind={['sun','people','wave'][i]} size={29}/><span>{benefit}</span></div>{/each}</div></div>

  <section class="roles-section wrap section-space" id="roles" aria-labelledby="roles-title">
    <div class="section-intro"><div><p class="eyebrow"><span class="section-number">01 /</span> {t.rolesLabel}</p><h2 id="roles-title">{t.rolesTitle}</h2></div><p>{t.rolesIntro}</p></div>
    <div class="role-grid">{#each t.roles as role,i}
      <article class="editorial-role role-tone-{i}" id={`role-${i}`}>
        <div class="role-top"><span class="role-index">0{i+1} /</span><span class="role-icon"><RoleIcon kind={role.icon} size={36}/></span></div>
        <p class="role-category">{role.type}</p><h3>{role.title}</h3><p class="role-description">{role.text}</p>
        <div class="role-tags">{#each role.detail.split(' · ') as tag}<span>{tag}</span>{/each}</div>
        <details class="role-details" id={`role-details-${i}`}><summary>{e.details}<span aria-hidden="true">+</span></summary><div class="role-detail-body"><h4>{e.responsibilities}</h4><ul>{#each e.roleDays[i] as day}<li>{day}</li>{/each}</ul><h4>{e.fit}</h4><p>{e.roleFits[i]}</p><div class="role-conditions"><h4>{e.conditions}</h4><p>{e.conditionsNote}</p></div></div></details>
        <a class="role-apply" href="#apply" onclick={(event) => { event.preventDefault(); chooseRole(i); }}>{e.choose}<span aria-hidden="true">↗</span></a>
      </article>
    {/each}</div>
    <RoleExplorer {lang} onchoose={exploreRole}/>
  </section>

  <section class="life-section"><div class="wrap life-inner"><div class="life-copy"><p class="eyebrow"><span class="section-number">02 /</span> {t.lifeLabel}</p><h2>{t.life1}<br/><span>{t.life2}</span></h2><p class="life-intro">{t.lifeIntro}</p><div class="life-rows">{#each t.lifeItems as item,i}<article><span>0{i+1}</span><div><h3>{item[0]}</h3><p>{item[1]}</p></div></article>{/each}</div></div><div class="life-editorial"><figure><img src={asset('/images/together-in-motion.svg')} alt={e.lifeAlt} width="1100" height="760" loading="lazy"/><figcaption><span>{e.lifeCaption}</span><span>BE SMILE / GOOD ENERGY</span></figcaption></figure><div class="life-note"><div><p>{e.lifeWords[0]}<br/><span>{e.lifeWords[1]}</span></p><span>{e.lifeNote}</span></div><img src={asset('/brand/symbol-ink.svg')} alt="" width="84" height="84"/></div></div></div></section>

  <section class="how-section wrap section-space" id="how"><div class="section-intro"><div><p class="eyebrow"><span class="section-number">03 /</span> {t.processLabel}</p><h2 class="line-breaks">{t.processTitle}</h2></div></div><div class="steps">{#each t.steps as step,i}<article><span class="step-num">0{i+1}<span aria-hidden="true">↗</span></span><h3>{step[0]}</h3><p>{step[1]}</p></article>{/each}</div></section>

  <section class="faq-section wrap"><div><p class="eyebrow">{t.faqLabel}</p><h2>{t.faqTitle}</h2></div><div class="faq-list">{#each t.faqs as faq}<details><summary>{faq[0]}<span aria-hidden="true">+</span></summary><p>{faq[1]}</p></details>{/each}</div></section>

  <section class="apply-section wrap" id="apply" aria-labelledby="application-title"><div class="apply-panel"><div class="apply-copy"><p class="eyebrow"><span class="section-number">04 /</span> {t.formLabel}</p><h2 class="line-breaks" id="application-title" tabindex="-1">{t.formTitle}</h2><p>{t.formIntro}</p><img src={asset('/brand/symbol-ink.svg')} alt="" width="105" height="105"/><span class="apply-location">BE SMILE / GOOD ENERGY CREW</span></div>
    <div class="application-card">
      {#if selectedRole !== ''}<div class="selected-role"><span class="selected-role-icon"><RoleIcon kind={t.roles[Number(selectedRole)].icon} size={24}/></span><div><span>{e.selected}</span><strong>{t.roles[Number(selectedRole)].type}</strong></div><a href="#roles" aria-label={e.change}>↗</a></div>{/if}
      <div class="availability-banner" class:availability-open={availability === 'open'} role="status"><span class="availability-dot" aria-hidden="true"></span><div><p class="availability-label">{e.checkLabel}</p><h3>{availability === 'checking' ? e.checking : availability === 'open' ? e.openLabel : availability === 'closed' ? e.closedLabel : e.unknownLabel}</h3>{#if availability !== 'checking'}<p>{availability === 'open' ? e.openNote : availability === 'closed' ? e.closedNote : e.unknownNote}</p>{/if}{#if availability === 'unknown' || (availability === 'closed' && !__DEMO_MODE__)}<button type="button" class="quiet-link" onclick={checkAvailability}>{e.retry} ↻</button>{/if}</div></div>
      <form onsubmit={apply} class="application-form" enctype="multipart/form-data" novalidate>
        <fieldset class="application-fields" disabled={availability !== 'open' || sending}>
          <legend class="sr-only">{t.formLabel}</legend>
          <label for="app-name">{t.name}<input id="app-name" name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder={t.namePlaceholder} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'name-error' : undefined} onblur={(event) => validateField(event.currentTarget)} oninput={(event) => { if(errors.name) validateField(event.currentTarget); }}/>{#if errors.name}<span class="field-error" id="name-error">{errors.name}</span>{/if}</label>
          <label for="app-contact">{t.contact}<input id="app-contact" name="contact" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="180" placeholder={t.contactPlaceholder} aria-invalid={errors.contact ? true : undefined} aria-describedby={errors.contact ? 'contact-error' : undefined} onblur={(event) => validateField(event.currentTarget)} oninput={(event) => { if(errors.contact) validateField(event.currentTarget); }}/>{#if errors.contact}<span class="field-error" id="contact-error">{errors.contact}</span>{/if}</label>
          <div class="form-row"><label for="app-role">{t.role}<select id="app-role" name="role" bind:value={selectedRole}><option value="">{t.rolePlaceholder}</option>{#each t.roles as role,i}<option value={String(i)}>{role.type}</option>{/each}</select></label><label for="app-language">{t.language}<select id="app-language" name="language" value={lang}><option value="ru">Русский</option><option value="tr">Türkçe</option><option value="de">Deutsch</option><option value="en">English</option></select></label></div>
          <details class="optional-cv"><summary>{cvText.label}<span aria-hidden="true">+</span></summary><div class="cv-field"><p class="cv-optional-note">{e.optional}</p><label class="sr-only" for="app-cv">{cvText.label}</label><div class="cv-upload"><span class="cv-upload-icon" aria-hidden="true">↥</span><div class="cv-upload-copy"><span class="cv-filename" aria-live="polite">{cvFile ? cvFile.name : cvText.choose}</span><span id="cv-hint">{cvText.hint}</span></div><input bind:this={cvInput} id="app-cv" name="cv" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-describedby={cvError ? 'cv-hint cv-error' : 'cv-hint'} aria-invalid={cvError ? true : undefined} onchange={selectCV}/></div>{#if cvFile || cvError}<div class="cv-selection"><span>{cvFile ? `${Math.max(1,Math.round(cvFile.size/1024))} KB` : cvText.empty}</span><button type="button" onclick={removeCV}>{cvText.remove} ×</button></div>{/if}{#if cvError}<p class="cv-error" id="cv-error" role="alert">{cvError}</p>{/if}</div></details>
          <div class="honey" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"/></label></div>
          <label class="consent"><input type="checkbox" name="consent" required value="yes" aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? 'consent-error' : undefined} onchange={(event) => validateField(event.currentTarget)}/><span>{t.consent} <a href={asset('/privacy/')} target="_blank" rel="noopener">{t.privacy} ↗</a></span></label>{#if errors.consent}<p class="field-error" id="consent-error">{errors.consent}</p>{/if}
          <button class="button dark" type="submit" disabled={availability !== 'open' || sending}>{sending ? t.sending : t.submit}<span aria-hidden="true">↗</span></button><p class="form-footnote">{t.formNote}</p>
        </fieldset>
        {#if message}<p class="form-message" class:success={result === 'success'} role={result === 'error' ? 'alert' : 'status'}>{message}</p>{/if}
      </form>
    </div>
  </div></section>
</main>
<footer class="site-footer wrap"><div class="footer-main"><a href={localePath(lang)} aria-label="Be Smile"><img src={asset('/brand/logo-primary.svg')} alt="Be Smile" width="190" height="43"/></a><p>{t.footer}</p><span>{t.footerSmall}</span></div><div class="footer-bottom"><span>© {new Date().getFullYear()} {t.rights}</span><a href={asset('/hotels/')}>{e.hotels} ↗</a><a href={asset('/privacy/')}>{t.privacy} ↗</a></div></footer>
<nav class="mobile-dock" class:dock-hidden={applicationVisible || keyboardOpen} aria-label={e.crew}><a href="#roles"><RoleIcon kind="sun" size={20}/><span>{mobileLabels[0]}</span></a><a href={asset('/hotels/')}><RoleIcon kind="people" size={20}/><span>{mobileLabels[1]}</span></a><a class="dock-apply" href="#apply"><span>{mobileLabels[2]}</span><span aria-hidden="true">↗</span></a></nav>
</div>
