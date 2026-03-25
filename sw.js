const CACHE = 'neurox-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if(e.request.url.includes('fonts.g')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(r=>{c.put(e.request,r.clone());return r;}).catch(()=>cached);
    })));return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached)return cached;
    return fetch(e.request).then(r=>{
      if(r.ok){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}return r;
    }).catch(()=>cached||new Response('Offline',{status:503}));
  }));
});
