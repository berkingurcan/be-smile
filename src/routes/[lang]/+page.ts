import { error, redirect } from '@sveltejs/kit';
import { base } from '../../lib/site';
export function load({params}:{params:{lang:string}}) {
  if(params.lang==='uk')redirect(308, `${base}/tr/`);
  if(!['tr','de','en'].includes(params.lang))error(404,'Page not found');
  return {lang:params.lang as 'tr'|'de'|'en'};
}
export const entries=()=>[{lang:'tr'},{lang:'de'},{lang:'en'},{lang:'uk'}];
