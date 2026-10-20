import { base } from '../../lib/site';
export const prerender = true;
export function GET() {
  return new Response(JSON.stringify({
    id: `${base}/`, name: 'Be Smile', short_name: 'Be Smile',
    description: 'Your next season. Antalya & Bodrum.',
    start_url: `${base}/`, scope: `${base}/`, display: 'standalone',
    background_color: '#F7F5EC', theme_color: '#F7F5EC',
    icons: [
      {src:`${base}/brand/app-icon-192.png`,sizes:'192x192',type:'image/png',purpose:'any'},
      {src:`${base}/brand/app-icon-512.png`,sizes:'512x512',type:'image/png',purpose:'any'},
      {src:`${base}/brand/app-icon-512.png`,sizes:'512x512',type:'image/png',purpose:'maskable'}
    ]
  }), {headers:{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'}});
}
