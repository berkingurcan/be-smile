<script lang="ts">
  import { copy } from '../content';
  import { MAX_CV_BYTES, cvCopy } from '../cv';
  import { asset, base, localePath, type Locale } from '../site';
  import RoleIcon from './RoleIcon.svelte';
  import { onMount } from 'svelte';
  let { lang = 'ru' }: {lang?:Locale} = $props();
  const t = $derived(copy[lang]);
  const hotelLabel=$derived({ru:'Для отелей',tr:'Oteller için',de:'Für Hotels',en:'For hotels'}[lang]);
  const cvText = $derived(cvCopy[lang]);
  let cvFile: File | null = $state(null);
  let cvInput: HTMLInputElement;
  let cvError = $state('');
  let selectedRole = $state('');
  let sending = $state(false);
  let message = $state('');
  let applicationVisible = $state(false);
  let keyboardOpen = $state(false);
  const mobileLabels = $derived({tr:['İşler','Süreç','Başvur'],ru:['Вакансии','Как это работает','Откликнуться'],de:['Jobs','Ablauf','Bewerben'],en:['Roles','How it works','Apply']}[lang]);
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => applicationVisible = entry.isIntersecting, {threshold:0});
    const panel = document.getElementById('apply');
    if (panel) observer.observe(panel);
    const viewport = window.visualViewport;
    const resize = () => keyboardOpen = !!viewport && window.innerHeight - viewport.height > 150;
    viewport?.addEventListener('resize', resize);
    return () => {observer.disconnect();viewport?.removeEventListener('resize', resize);};
  });
  let result: 'success' | 'error' | '' = $state('');
  $effect(() => { document.documentElement.lang = lang; });

  function selectCV(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    cvError = ''; cvFile = null;
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name) || file.size > MAX_CV_BYTES || file.size === 0) {
      cvError = cvText.error; input.value = ''; return;
    }
    cvFile = file;
  }
  function removeCV() { cvInput.value = ''; cvFile = null; cvError = ''; }

  async function apply(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    if (cvError) return;
    message = ''; result = ''; sending = true;
    try {
      if (__DEMO_MODE__) { message = t.unavailable; result = 'error'; return; }
      const data = new FormData(form);
      if (!cvFile) data.delete('cv');
      const response = await fetch(`${base}/api/apply/`, {method:'POST',body:data});
      const body = await response.json();
      if (!response.ok) { message = body.code === 'invalid_cv' || response.status === 413 ? cvText.error : response.status === 503 ? t.unavailable : response.status === 400 ? t.invalid : t.failure; result = 'error'; return; }
      if (body.ok !== true) throw new Error('Delivery not confirmed');
      message = t.success; result = 'success'; form.reset(); selectedRole = ''; cvFile = null; cvError = '';
    } catch { message = t.failure; result = 'error'; }
    finally { sending = false; }
  }
</script>

<svelte:head>
  <title>{t.title}</title>
  <meta name="description" content={t.description}/>
  <meta property="og:title" content={t.title}/>
  <meta property="og:description" content={t.description}/>
  <meta property="og:type" content="website"/>
  <meta name="twitter:card" content="summary_large_image"/>
</svelte:head>

<a class="skip-link" href="#main">{t.skip}</a>
<header class="site-header wrap">
  <a class="logo-link" href={localePath(lang)} aria-label="Be Smile"><img src={asset('/brand/logo-primary.svg')} alt="Be Smile" width="188" height="43"/></a>
  <nav class="header-nav" aria-label={lang === 'tr' ? 'Ana menü' : lang === 'de' ? 'Hauptnavigation' : lang === 'ru' ? 'Главная навигация' : 'Main navigation'}>
    <a class="roles-nav" href="#roles">{t.nav}</a>
    <a class="roles-nav" href={asset('/hotels/')}>{hotelLabel}</a>
    <div class="languages" aria-label={lang==='tr'?'Dil seçimi':'Language'}>
      <a href={localePath('ru')} lang="ru" hreflang="ru" aria-label="Русский" aria-current={lang==='ru'?'page':undefined}>RU</a>
      <a href={localePath('tr')} lang="tr" hreflang="tr" aria-label="Türkçe" aria-current={lang==='tr'?'page':undefined}>TR</a>
      <a href={localePath('de')} lang="de" hreflang="de" aria-label="Deutsch" aria-current={lang==='de'?'page':undefined}>DE</a>
      <a href={localePath('en')} lang="en" hreflang="en" aria-label="English" aria-current={lang==='en'?'page':undefined}>EN</a>
    </div>
    <a href="#apply" class="button small dark header-apply">{t.apply}<span aria-hidden="true">↗</span></a>
  </nav>
</header>
<main id="main">
  <section class="recruit-hero wrap">
    <div class="hero-copy">
      <p class="eyebrow"><span class="status-dot"></span>{t.eyebrow}</p>
      <h1>{t.hero1}<br/><span>{t.hero2}</span></h1>
      <p class="hero-intro">{t.intro}</p>
      <div class="hero-actions"><a class="button dark" href="#roles">{t.heroCta}<span aria-hidden="true">↗</span></a><a href="#how" class="quiet-link">{t.heroSecondary}<span aria-hidden="true">↓</span></a></div>
      <p class="hero-note"><span aria-hidden="true">↳</span>{t.heroNote}</p>
    </div>
    <div class="hero-art">
      <div class="coast-frame"><img src={asset('/brand/coast.svg')} alt={lang==='en'?'Illustrated sunny Mediterranean coast':lang==='tr'?'Güneşli Akdeniz kıyısı illüstrasyonu':lang==='de'?'Illustration einer sonnigen Mittelmeerküste':'Иллюстрация солнечного средиземноморского побережья'} width="800" height="900" fetchpriority="high"/></div>
      <div class="art-index" aria-hidden="true"><span>BE SMILE / COASTAL LIFE</span><span>01 — 02</span></div>
      <div class="coast-ticket"><img src={asset('/brand/symbol-ink.svg')} alt="" width="44" height="44"/><div><span>{lang==='tr'?'BİR SONRAKİ HİKÂYEN':lang==='ru'?'ТВОЯ НОВАЯ ИСТОРИЯ':lang==='de'?'DEIN NÄCHSTES KAPITEL':'YOUR NEXT CHAPTER'}</span><strong>{lang==='tr'?'İyi bir sezon.':lang==='ru'?'Твой новый сезон.':lang==='de'?'Deine nächste Saison.':'Your next season.'}</strong></div><span class="ticket-arrow" aria-hidden="true">↗</span></div>
    </div>
  </section>
  <div class="benefit-band"><div class="wrap benefit-inner">{#each t.benefits as benefit,i}<div><RoleIcon kind={['sun','people','wave'][i]} size={29}/><span>{benefit}</span></div>{/each}</div></div>

  <section class="roles-section wrap section-space" id="roles">
    <div class="section-intro"><div><p class="eyebrow">{t.rolesLabel}</p><h2>{t.rolesTitle}</h2></div><p>{t.rolesIntro}</p></div>
    <div class="role-grid">{#each t.roles as role,i}
      <article class="job-card job-{i}"><div class="job-head"><span>0{i+1} / BE SMILE</span><RoleIcon kind={role.icon} size={57}/></div><p class="job-category">{role.type}</p><h3>{role.title}</h3><p class="job-description">{role.text}</p><p class="job-detail">{role.detail}</p><a href="#apply" onclick={()=>selectedRole=String(i)}>{t.roleCta}<span aria-hidden="true">↗</span></a></article>
    {/each}</div>
  </section>

  <section class="life-section"><div class="wrap life-inner"><div class="life-copy"><p class="eyebrow">{t.lifeLabel}</p><h2>{t.life1}<br/><span>{t.life2}</span></h2><p class="life-intro">{t.lifeIntro}</p><div class="life-rows">{#each t.lifeItems as item,i}<article><span>0{i+1}</span><div><h3>{item[0]}</h3><p>{item[1]}</p></div></article>{/each}</div></div><div class="life-poster"><img class="poster-logo" src={asset('/brand/logo-ink.svg')} alt="Be Smile" width="150" height="34"/><p>{lang==='tr'?'yeni beceriler.':'new skills.'}<br/>{lang==='tr'?'yeni dostlar.':'new friends.'}<br/><span>{lang==='tr'?'güzel bir yaz.':'your season.'}</span></p><img class="poster-sun" src={asset('/brand/symbol-ink.svg')} alt="" width="200" height="200"/><span class="poster-caption">{lang==='tr'?'GÜNEŞLİ GÜNLER, YENİ FIRSATLAR.':'A LITTLE SUN. A LOT OF POSSIBILITY.'}</span><div class="poster-sticker">{lang==='tr'?'deniz kenarında':'see you'}<br/>{lang==='tr'?'görüşürüz.':'by the sea.'}</div></div></div></section>

  <section class="how-section wrap section-space" id="how"><p class="eyebrow">{t.processLabel}</p><h2 class="line-breaks">{t.processTitle}</h2><div class="steps">{#each t.steps as step,i}<article><span class="step-num">0{i+1}<span aria-hidden="true">↗</span></span><h3>{step[0]}</h3><p>{step[1]}</p></article>{/each}</div></section>

  <section class="faq-section wrap"><div><p class="eyebrow">{t.faqLabel}</p><h2>{t.faqTitle}</h2></div><div class="faq-list">{#each t.faqs as faq}<details><summary>{faq[0]}<span aria-hidden="true">+</span></summary><p>{faq[1]}</p></details>{/each}</div></section>

  <section class="apply-section wrap" id="apply"><div class="apply-panel"><div class="apply-copy"><p class="eyebrow">{t.formLabel}</p><h2 class="line-breaks">{t.formTitle}</h2><p>{t.formIntro}</p><img src={asset('/brand/symbol-ink.svg')} alt="" width="105" height="105"/><span class="apply-location">BE SMILE / GOOD ENERGY CREW</span></div><form onsubmit={apply} class="application-form" enctype="multipart/form-data">
    <label for="app-name">{t.name}<input id="app-name" name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder={t.namePlaceholder}/></label>
    <label for="app-contact">{t.contact}<input id="app-contact" name="contact" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="180" autocomplete="email" placeholder={t.contactPlaceholder}/></label>
    <div class="form-row"><label for="app-role">{t.role}<select id="app-role" name="role" bind:value={selectedRole}><option value="">{t.rolePlaceholder}</option>{#each t.roles as role,i}<option value={String(i)}>{role.type}</option>{/each}</select></label><label for="app-language">{t.language}<select id="app-language" name="language" value={lang}><option value="ru">Русский</option><option value="tr">Türkçe</option><option value="de">Deutsch</option><option value="en">English</option></select></label></div>
    <div class="cv-field">
      <label for="app-cv">{cvText.label}</label>
      <div class="cv-upload"><span class="cv-upload-icon" aria-hidden="true">↥</span><div class="cv-upload-copy"><span class="cv-filename" aria-live="polite">{cvFile ? cvFile.name : cvText.choose}</span><span id="cv-hint">{cvText.hint}</span></div><input bind:this={cvInput} id="app-cv" name="cv" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-describedby={cvError?'cv-hint cv-error':'cv-hint'} aria-invalid={cvError?true:undefined} onchange={selectCV}/></div>
      {#if cvFile || cvError}<div class="cv-selection"><span>{cvFile ? `${Math.max(1, Math.round(cvFile.size / 1024))} KB` : cvText.empty}</span><button type="button" onclick={removeCV}>{cvText.remove} ×</button></div>{/if}
      {#if cvError}<p class="cv-error" id="cv-error" role="alert">{cvError}</p>{/if}
    </div>
    <div class="honey" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"/></label></div>
    <label class="consent"><input type="checkbox" name="consent" required value="yes"/><span>{t.consent} <a href={asset('/privacy/')} target="_blank" rel="noopener">{t.privacy} ↗</a></span></label>
    <button class="button dark" type="submit" disabled={sending}>{sending?t.sending:t.submit}<span aria-hidden="true">↗</span></button>
    <p class="form-footnote">{t.formNote}</p>
    {#if message}<p class="form-message" class:success={result==='success'} role={result==='error'?'alert':'status'}>{message}</p>{/if}
  </form></div></section>
</main>
<footer class="site-footer wrap"><div class="footer-main"><a href={localePath(lang)} aria-label="Be Smile"><img src={asset('/brand/logo-primary.svg')} alt="Be Smile" width="190" height="43"/></a><p>{t.footer}</p><span>{t.footerSmall}</span></div><div class="footer-bottom"><span>© {new Date().getFullYear()} {t.rights}</span><a href={asset('/hotels/')}>{hotelLabel} ↗</a><a href={asset('/privacy/')}>{t.privacy} ↗</a></div></footer>

<nav class="mobile-dock" class:dock-hidden={applicationVisible || keyboardOpen} aria-label={lang==='tr'?'Hızlı menü':'Quick navigation'}>
  <a href="#roles"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M8 7V4h8v3M4 12h16M10 12v3h4v-3"/></svg><span>{mobileLabels[0]}</span></a>
  <a href="#how"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg><span>{mobileLabels[1]}</span></a>
  <a class="dock-apply" href="#apply"><span>{mobileLabels[2]}</span><span aria-hidden="true">↗</span></a>
</nav>
