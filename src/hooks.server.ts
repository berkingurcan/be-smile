import type { Handle } from '@sveltejs/kit/hooks';
export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.url.pathname.includes('/brand') ? 'en' : event.url.pathname.includes('/hotels') ? 'tr' : event.params.lang || 'ru';
  return resolve(event, { transformPageChunk: ({ html }) => html.replace('<html lang="ru">', `<html lang="${lang}">`) });
};
