import { defineConfig, loadEnv } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import staticAdapter from '@sveltejs/adapter-static';
import vercelAdapter from '@sveltejs/adapter-vercel';

const isStatic = process.env.BE_SMILE_STATIC === '1';
const publicContact=loadEnv(process.env.NODE_ENV || 'production',process.cwd(),'PUBLIC_');
export default defineConfig({
  plugins: [sveltekit({
    adapter: isStatic ? staticAdapter({ strict: false }) : vercelAdapter({ runtime: 'nodejs24.x' }),
    paths: { base: (process.env.BE_SMILE_BASE || '') as '' | `/${string}` },
    prerender: { entries: ['/', '/tr/', '/de/', '/uk/', '/en/', '/brand/', '/hotels/', '/privacy/'] }
  })],
  define: { __DEMO_MODE__: JSON.stringify(isStatic), __SITE_BASE__: JSON.stringify(process.env.BE_SMILE_BASE || ''), __HOTEL_PHONE__: JSON.stringify(process.env.PUBLIC_HOTEL_PHONE || publicContact.PUBLIC_HOTEL_PHONE || ''), __CONTACT_EMAIL__: JSON.stringify(process.env.PUBLIC_CONTACT_EMAIL || publicContact.PUBLIC_CONTACT_EMAIL || '') }
});
