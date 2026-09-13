const CACHE='sharia-clinics-pwa-v31';
const ASSETS=['./','./index.html','./manifest.webmanifest','./sw.js','./fix.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).then(async r=>{
   const ct=r.headers.get('content-type')||'';
   if(ct.includes('text/html')){
    const t=await r.text();
    const patched=t.includes('fix.js')?t:t.replace('</body>','<script src="fix.js"></script></body>');
    return new Response(patched,{status:r.status,statusText:r.statusText,headers:r.headers});
   }
   return r;
  }).catch(()=>caches.match('./index.html')));return;
 }
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
