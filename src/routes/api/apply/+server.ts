import { json } from '@sveltejs/kit';
import { RESEND_API_KEY, APPLICATION_TO_EMAIL, APPLICATION_FROM_EMAIL } from '$app/env/private';
import { validateApplication, applicationEmail, readApplication, cvAttachment, ApplicationInputError } from '../../../lib/server/application.mjs';
import type { RequestHandler } from './$types';

export const prerender = false;
export const GET: RequestHandler = () => json(
  {available: Boolean(RESEND_API_KEY && APPLICATION_TO_EMAIL && APPLICATION_FROM_EMAIL)},
  {headers: {'Cache-Control': 'no-store'}}
);

export const POST: RequestHandler = async ({ request, url, fetch }) => {
  const headers = { 'Cache-Control':'no-store' };
  if (request.headers.get('origin') !== url.origin) return json({ok:false},{status:403,headers});
  let parsed;
  try { parsed = await readApplication(request); }
  catch (error) {
    const status = error instanceof ApplicationInputError ? error.status : 400;
    return json({ok:false,code:error instanceof ApplicationInputError ? error.code : 'invalid'},{status,headers});
  }
  const validated=validateApplication(parsed.input);
  if(validated.bot)return json({ok:true},{status:202,headers});
  if(!validated.valid)return json({ok:false},{status:400,headers});
  let attachment;
  try { attachment = await cvAttachment(parsed.file); }
  catch (error) {
    return json({ok:false,code:'invalid_cv'},{status:error instanceof ApplicationInputError ? error.status : 400,headers});
  }
  const apiKey=RESEND_API_KEY, recipient=APPLICATION_TO_EMAIL, from=APPLICATION_FROM_EMAIL;
  if(!apiKey||!recipient||!from)return json({ok:false,code:'unavailable'},{status:503,headers});
  try {
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[recipient],subject:'Be Smile — new crew application',text:applicationEmail(validated.data),...(attachment?{attachments:[attachment]}:{})}),signal:AbortSignal.timeout(12000)});
    if(!response.ok)return json({ok:false},{status:502,headers});
    const sent=await response.json();
    if(typeof sent.id!=='string')return json({ok:false},{status:502,headers});
    return json({ok:true},{status:200,headers});
  }catch{return json({ok:false},{status:502,headers});}
};
