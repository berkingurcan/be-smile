# Be Smile / Sunshine

The minimal **Smile Disc** identity and a simple recruitment website for Russian-, Turkish-, German- and English-speaking young people interested in seasonal hotel entertainment work in Antalya and Bodrum.

## Run locally

Use Node 24 LTS.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Routes:

- `/` — Russian recruitment page
- `/tr/` — Turkish recruitment page
- `/de/` — German recruitment page
- `/uk/` — legacy link redirects to Turkish
- `/en/` — English recruitment page for review
- `/brand/` — full visual identity presentation
- `/hotels/` — professional hotel partner page: exactly two sections, with founders, mobile phone and email contact
- `/privacy/` — application data explanation
- `/api/apply/` — server-side application delivery on Vercel

## Deploy to Vercel

1. Put this **be-smile directory** in a Git repository, or choose `be-smile` as the Root Directory when importing the whole workspace.
2. Import the repository into Vercel. Framework preset: **SvelteKit**.
3. Build command: `npm run build`. Keep the output setting at the SvelteKit default; the official Vercel adapter generates the deployment.
4. Add the server-only variables below and deploy. The website itself does not require secrets to render.

Alternatively, from this folder run `npx vercel`, select the intended Vercel project and follow its normal login/deployment flow. No Vercel project or credentials are embedded here.

The implementation uses the official SvelteKit Vercel adapter. References: [Vercel SvelteKit deployment](https://vercel.com/docs/frameworks/full-stack/sveltekit) and [SvelteKit adapter documentation](https://svelte.dev/docs/kit/adapter-vercel).

## Add the application email later

Copy `.env.example` to `.env` locally. On Vercel set the same variables under Project Settings → Environment Variables:

```dotenv
RESEND_API_KEY=your_server_only_resend_key
APPLICATION_TO_EMAIL=the_agency_recipient_address
APPLICATION_FROM_EMAIL=Be Smile <a_sender_at_your_verified_domain>
```

`APPLICATION_FROM_EMAIL` must be a sender permitted by your Resend account and verified domain. Never prefix the API key with `PUBLIC_` or expose it in client code.

The form accepts an optional CV (PDF or DOCX, up to 3 MB). The file is sent as an email attachment when delivery is configured; it is not stored in a public file bucket. The form validates name, contact, role, language and consent, rejects oversized requests and invalid origins, and includes a hidden bot-trap field. It only reports delivery success after the email provider returns a message ID. If settings are absent, it returns an explicit unavailable state and does not discard entered values. No applications are logged or saved by this repository.

Email transport reference: [Resend Send Email API](https://resend.com/docs/api-reference/emails/send-email). The 3 MB CV limit leaves room for multipart fields within the [Vercel Function request limit](https://vercel.com/docs/functions/limitations#request-body-size). File extension and content signature checks run server-side, and the request stream is size-limited before parsing.

No emails were sent during development. Add delivery settings, test the actual inbox and review your business's data-processing information before opening recruitment. For a high-volume public launch, enable Vercel Firewall rate limiting for `/api/apply/` in the Vercel dashboard.

## Design system

- Sunshine `#F4C84A`: energy, highlights, identity applications.
- Warm cream `#F7F5EC`: main canvas.
- Deep green `#183D32`: core text, controls, one-colour logos.
- Warm coral `#B44E38`: decorative accent.
- Coastal sage `#DCE5DA`: calm supporting panels.
- Accessible coral text `#9D432F`: small coral text on cream.
- Headings: Manrope 450–700. Body: Golos Text 400–500. Both self-hosted with Cyrillic support.

The logo uses one disc and one smile cutout, with no eyes or rays. SVG and transparent PNG masters, outlined wordmarks, icon variants, construction sheet, crew uniform/pass artwork and machine-readable tokens are in `static/brand/`. Logo text is converted to vector paths and does not depend on a font being installed. Font licenses are included. The identity presentation explains minimum sizes, clear space, colour variants and practical usage.

`scripts/create-brand.mjs` generates the artwork from the supplied open-license font. Run `node scripts/create-brand.mjs` with the same architecture/runtime used for `npm ci`. Static PNG exports use resvg; these are logo exports, not browser screenshots.

## Checks and exports

```sh
npm run check
npm test
npm run build
node scripts/verify-built-api.mjs
```

`npm run build:static` creates a second build for the existing public ChatGPT collection under `/be-smile/`. It intentionally excludes the email endpoint and clearly states that online applications are not open. The Vercel build includes the real endpoint. This prevents the public design preview from implying that it sends applications.

Screenshots are supplied under `deliverables/screenshots/` in the handoff archive. They are captured from the actual browser, not rendered marketing mockups.

## Content updates

Translations: `src/lib/content.ts`. Current design tokens and responsive refinements: `src/refinement.css`; foundation: `src/app.css`. Agency delivery settings: `.env` / Vercel variables. Logo sources: `scripts/create-brand.mjs`. No salary, hotel partnership, eligibility or live vacancy is invented. Confirm role-specific terms before publishing recruitment claims.

## Hotel partner route

`/hotels/` has exactly two content sections: hotel crew services, then the founders and direct contact. Co-founders: Berkin Gürcan and İsmail Şen. There is no hotel contact form.

Set `PUBLIC_HOTEL_PHONE` and `PUBLIC_CONTACT_EMAIL` in `.env` locally or Vercel Environment Variables, then rebuild. The phone becomes a `tel:` link and the email a `mailto:` link. These public values are intentionally visible to visitors. Empty values show a clear pending state rather than invented contact details.

## Mobile and PWA

The layout is checked at 320, 390, 768 and 1440 CSS pixels. Mobile language links are 44 × 44 px, the bottom navigation has 52 px targets, and application fields use 16 px text with 54 px controls. The bottom navigation hides when the application is visible or a form field is focused. Safe-area insets, browser zoom, reduced-motion preferences and keyboard resizing are supported.

`/manifest.webmanifest` is generated with the correct deployment base path, standalone display mode, app identity, and 192/512 px standard and maskable PNG icons. A separate 180 px Apple touch icon is included. The service worker is registered only in production over HTTPS (localhost is also a secure browser context). It supplies a localized offline fallback for navigation; it never caches application requests, CVs or form data. It does not create offline drafts or promise delivery while offline.

Installation UI depends on the browser and OS. Real iOS/Android installation and virtual keyboard behaviour still need a physical-device check. See [MDN installability guidance](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [web.dev manifest guidance](https://web.dev/learn/pwa/web-app-manifest), and [safe-area insets](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env).

## Commit and publish your repository

The local working copy is initialized on `main`. Review the files, then make your first commit:

```sh
git status
git add .
git commit -m "Initial Be Smile website"
```

Create an empty repository with your Git provider, then connect its URL:

```sh
git remote add origin <your-repository-url>
git push -u origin main
```

No remote is configured by this handoff. Private `.env` files, dependencies, build output and screenshot captures are ignored; `.env.example` is included for deployment configuration.
