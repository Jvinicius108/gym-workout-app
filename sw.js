const CACHE_NAME = 'gym-workout-v27';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/app.js',
  './js/config.js',
  './js/congratulations.json',
  './js/celebration_confetti.json',
  './js/db.js',
  './js/state.js',
  './js/timers.js',
  './js/ui.js',
  './js/ui-evolution.js',
  './js/ui-settings.js',
  './js/utils.js',
  './js/water.js',
  './js/quotes.js',
  './js/mascot_quotes.js',
  './js/success.json',
  './js/failure.json',
  './js/flame.json',
  './js/flame_cold.json',
  './js/flame_ultra.json',
  './apple-touch-icon.png',
  './icon-192x192.png',
  './icon-512x512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.warn('Falha ao cachear:', url)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  // Ignora requisições do Firebase e métodos que não sejam GET
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('googleapis.com') || e.request.method !== 'GET') {
      return; 
  }

  // ✅ CORREÇÃO: Estratégia diferente para a página HTML (Network First com Timeout)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      Promise.race([
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return networkResponse;
        }),
        // Se a rede demorar mais de 3 segundos, cai no catch e usa o cache
        new Promise((_, reject) => setTimeout(reject, 3000))
      ]).catch(() => {
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          return caches.match('./index.html'); // Fallback final
        });
      })
    );
    return;
  }

  // ✅ Para CSS, JS, imagens e JSON, mantemos o Cache First (Stale-While-Revalidate)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });

      return cachedResponse || fetchPromise;
    })
  );
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) client = clientList[i];
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});