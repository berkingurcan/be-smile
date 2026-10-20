import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../static/service-worker.js', import.meta.url),'utf8');
function worker(base='/be-smile/') {
  const handlers = {}, added=[], removed=[]; let requested=0, claimed=0;
  const context={URL,Response,self:{location:{href:`https://example.invalid${base}service-worker.js`},clients:{claim(){claimed++;return Promise.resolve();}},addEventListener(type,handler){handlers[type]=handler;}},
    caches:{async open(){return {async add(url){added.push(url);}};},async keys(){return [`be-smile-public-${base}-old`,`other-application-cache`];},async delete(key){removed.push(key);return true;},async match(){return new Response('public offline fallback');}},
    async fetch(){requested++;throw new Error('offline');}};
  vm.runInNewContext(source,context);
  return {handlers,added,removed,get requested(){return requested;},get claimed(){return claimed;}};
}
test('worker installs only a public fallback and removes only its own old cache',async()=>{
  const w=worker();let pending;
  w.handlers.install({waitUntil(p){pending=p;}});await pending;
  assert.deepEqual(w.added,['https://example.invalid/be-smile/offline.html']);
  w.handlers.activate({waitUntil(p){pending=p;}});await pending;
  assert.deepEqual(w.removed,['be-smile-public-/be-smile/-old']);assert.equal(w.claimed,1);
});
test('offline navigation receives a fallback for both root and subpath deployment',async()=>{
  for(const base of ['/','/be-smile/']){
    const w=worker(base);let result;
    w.handlers.fetch({request:{method:'GET',url:`https://example.invalid${base}tr/`,mode:'navigate'},respondWith(p){result=p;}});
    assert.equal(await (await result).text(),'public offline fallback');assert.equal(w.requested,1);
  }
});
test('worker never intercepts applications, uploads, assets or another site',()=>{
  const w=worker();
  for(const request of [
    {method:'POST',url:'https://example.invalid/be-smile/api/apply/',mode:'navigate'},
    {method:'GET',url:'https://example.invalid/be-smile/api/apply/',mode:'navigate'},
    {method:'GET',url:'https://example.invalid/be-smile/brand/logo-primary.svg',mode:'cors'},
    {method:'GET',url:'https://example.invalid/other-site/',mode:'navigate'},
    {method:'GET',url:'https://another.invalid/be-smile/',mode:'navigate'}
  ])w.handlers.fetch({request,respondWith(){assert.fail('Private or unrelated request intercepted');}});
  assert.equal(w.requested,0);
});
