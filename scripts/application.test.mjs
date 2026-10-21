import test from 'node:test';
import assert from 'node:assert/strict';
import { validateApplication, applicationEmail } from '../src/lib/server/application.mjs';
const valid={name:'Алексей Ковалёв',contact:'@test',language:'ru',role:'1',consent:'yes',website:''};
test('accepts Russian, Turkish, German and English applications without losing Cyrillic',()=>{for(const language of ['ru','tr','de','en']){const result=validateApplication({...valid,language});assert.equal(result.valid,true);assert.equal(result.data.name,valid.name);assert.match(applicationEmail(result.data),/Алексей Ковалёв/);}});
test('requires consent and meaningful contact details',()=>{assert.equal(validateApplication({...valid,consent:''}).valid,false);assert.equal(validateApplication({...valid,contact:' '}).valid,false);});
test('rejects oversized fields, invalid roles and injected newlines',()=>{for(const patch of [{name:'A'.repeat(101)},{role:'CEO'},{name:'Name\nBcc: x@y.com'},{language:'unknown'}])assert.equal(validateApplication({...valid,...patch}).valid,false);});
test('separates honeypot submissions and rejects non-object bodies',()=>{assert.equal(validateApplication({...valid,website:'spam.example'}).bot,true);for(const bad of [null,[],42,'text'])assert.equal(validateApplication(bad).valid,false);});

test("rejects removed Ukrainian communication option",()=>assert.equal(validateApplication({...valid,language:"uk"}).valid,false));

test('social profile is optional and supported platforms appear in the application email',()=>{
  for (const patch of [{}, {socialPlatform:'',socialUsername:''}]) {
    const result=validateApplication({...valid,...patch});
    assert.equal(result.valid,true);assert.doesNotMatch(applicationEmail(result.data),/Social media:/);
  }
  for (const [socialPlatform,label] of [['instagram','Instagram'],['vk','VK'],['tiktok','TikTok'],['telegram','Telegram'],['youtube','YouTube'],['facebook','Facebook'],['other','Other']]) {
    const result=validateApplication({...valid,socialPlatform,socialUsername:' @тест_crew '});
    assert.equal(result.valid,true);assert.equal(result.data.socialUsername,'@тест_crew');
    assert.ok(applicationEmail(result.data).includes(`Social media: ${label} — @тест_crew`));
  }
});
test('rejects incomplete social profiles, unsupported platforms, oversized usernames and control characters',()=>{
  for (const patch of [
    {socialPlatform:'instagram'}, {socialUsername:'@crew'},
    {socialPlatform:'unknown',socialUsername:'@crew'},
    {socialPlatform:'vk',socialUsername:'a'.repeat(101)},
    {socialPlatform:'tiktok',socialUsername:'@crew name'},
    {socialPlatform:'instagram',socialUsername:'@crew\nBcc:team@example.invalid'},
    {socialPlatform:'vk',socialUsername:'@crew\u0000'},
    {socialPlatform:[],socialUsername:'@crew'}, {socialPlatform:'vk',socialUsername:42}
  ]) {
    const result=validateApplication({...valid,...patch});
    assert.equal(result.valid,false);assert.equal(result.code,'invalid_social');
  }
});

const {cvAttachment,readApplication,MAX_CV_BYTES,MAX_APPLICATION_BYTES}=await import('../src/lib/server/application.mjs');
const pdfBytes=Buffer.from('%PDF-1.7\nTest CV\n%%EOF');
const pdf=new File([pdfBytes],'Özge CV.pdf',{type:'application/pdf'});
test('CV is optional and an empty browser file does not become an attachment',async()=>{
  assert.equal(await cvAttachment(null),null);
  assert.equal(await cvAttachment(new File([],'')),null);
  const form=new FormData();for(const [key,value] of Object.entries(valid))form.set(key,value);
  const parsed=await readApplication(new Request('https://besmile.test/api/apply/',{method:'POST',body:form}));
  assert.equal(validateApplication(parsed.input).valid,true);assert.equal(await cvAttachment(parsed.file),null);
});
test('multipart application preserves PDF bytes for the email attachment',async()=>{
  const form=new FormData();for(const [key,value] of Object.entries(valid))form.set(key,value);form.set('cv',pdf);
  const parsed=await readApplication(new Request('https://besmile.test/api/apply/',{method:'POST',body:form}));
  assert.equal(validateApplication(parsed.input).valid,true);
  const attachment=await cvAttachment(parsed.file);assert.equal(attachment.filename,'cv.pdf');assert.deepEqual(Buffer.from(attachment.content,'base64'),pdfBytes);
});
test('accepts a DOCX container with Word entries, rejects renamed files and unrelated ZIPs',async()=>{
  const docx=new File([Buffer.from([0x50,0x4b,0x03,0x04]),'[Content_Types].xml\0word/document.xml'],'CV.docx');
  assert.equal((await cvAttachment(docx)).filename,'cv.docx');
  for(const file of [new File(['hello'],'cv.pdf'),new File([pdfBytes],'cv.exe'),new File(['PK\x03\x04images/photo.jpg'],'cv.docx'),new File([],'cv.pdf')])await assert.rejects(cvAttachment(file),{status:400,code:'invalid_cv'});
});
test('rejects CVs over 3 MB and duplicate attachment fields',async()=>{
  await assert.rejects(cvAttachment(new File([new Uint8Array(MAX_CV_BYTES+1)],'cv.pdf')),{status:413,code:'invalid_cv'});
  const form=new FormData();form.append('cv',pdf);form.append('cv',pdf);
  await assert.rejects(readApplication(new Request('https://besmile.test',{method:'POST',body:form})),{status:400});
});
test('enforces the request limit even without Content-Length',async()=>{
  const request=new Request('https://besmile.test',{method:'POST',headers:{'Content-Type':'multipart/form-data; boundary=test'},body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(MAX_APPLICATION_BYTES+1));controller.close();}}),duplex:'half'});
  await assert.rejects(readApplication(request),{status:413});
});
