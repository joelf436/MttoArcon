// Service worker de ARCON HVAC: guarda la app para que abra sin internet.
// Estrategia: se sirve lo guardado al instante y se actualiza en segundo plano (la nueva versión se ve al abrir de nuevo).
// Los datos de los mantenimientos NO pasan por aquí: viven en IndexedDB, solo en cada teléfono.
const CACHE = 'arcon-hvac-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch:true}).then(cached=>{
    const red = fetch(req).then(res=>{
      if(res && res.ok){ const copia = res.clone(); caches.open(CACHE).then(c=>c.put(req, copia)); }
      return res;
    }).catch(()=> cached || (req.mode==='navigate' ? caches.match('./index.html') : undefined));
    return cached || red;
  }));
});
