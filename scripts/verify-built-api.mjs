// Run after `npm run build`. All email delivery is mocked; no network calls.
import assert from 'node:assert/strict';
const {set_env}=await import('../.svelte-kit/output/server/env.js');
set_env({RESEND_API_KEY:'development-test-only',APPLICATION_TO_EMAIL:'team@example.invalid',APPLICATION_FROM_EMAIL:'Be Smile <from@example.invalid>'});
const {POST}=await import('../.svelte-kit/output/server/entries/endpoints/api/apply/_server.ts.js');
const pdf=Buffer.from('%PDF-1.7\nSynthetic CV\n%%EOF');
const url=new URL('https://besmile.test/api/apply/');
function request(file,origin=url.origin) {
  const form=new FormData();
  for(const [key,value] of Object.entries({name:'Deneme Adayı',contact:'test@example.invalid',language:'tr',role:'1',consent:'yes'}))form.set(key,value);
  if(file)form.set('cv',file);
  return new Request(url,{method:'POST',headers:{Origin:origin},body:form});
}
let calls=0,payload;
const mockFetch=async(target,options)=>{calls++;assert.equal(target,'https://api.resend.com/emails');payload=JSON.parse(options.body);return Response.json({id:'mock-message-id'});};
let response=await POST({request:request(new File([pdf],'test.pdf')),url,fetch:mockFetch});
assert.equal(response.status,200);assert.equal((await response.json()).ok,true);assert.deepEqual(Buffer.from(payload.attachments[0].content,'base64'),pdf);assert.equal(payload.attachments[0].filename,'cv.pdf');assert.match(payload.text,/Deneme Adayı/);
response=await POST({request:request(),url,fetch:mockFetch});
assert.equal(response.status,200);assert.equal(payload.attachments,undefined);
const before=calls;
response=await POST({request:request(new File(['Not a PDF'],'renamed.pdf')),url,fetch:mockFetch});
assert.equal(response.status,400);assert.equal((await response.json()).code,'invalid_cv');assert.equal(calls,before);
response=await POST({request:request(null,'https://different.test'),url,fetch:mockFetch});assert.equal(response.status,403);assert.equal(calls,before);
response=await POST({request:request(),url,fetch:async()=>Response.json({message:'Rejected'},{status:422})});assert.equal(response.status,502);
response=await POST({request:request(),url,fetch:async()=>Response.json({})});assert.equal(response.status,502);
console.log('6 built API checks passed; email delivery mocked, no email sent.');
