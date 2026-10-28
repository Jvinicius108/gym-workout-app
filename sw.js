const CACHE_NAME = 'gym-workout-v202610281646';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/app.js',
  './js/config.js',
  './js/theme-init.js',
  './js/congratulations.json',
  './js/celebration_confetti.json',
  './js/db.js',
  './js/state.js',
  './js/timers.js',
  './js/ui.js',
  './js/ui-evolution.js',
  './js/ui-settings.js',
  './js/ui-admin.js',
  './js/substitutions.js',
  './js/utils.js',
  './js/water.js',
  './js/quotes.js',
  './js/mascot_quotes.js',
  './js/helpers.js',
  './js/streak.js',
  './js/sync.js',
  './js/auth.js',
  './js/water-reminder.js',
  './js/handlers/water.js',
  './js/handlers/drawer.js',
  './js/handlers/workout.js',
  './js/handlers/onboarding.js',
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
  const url = e.request.url;

  if (
    e.request.method !== 'GET' ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('firebaseapp.com')
  ) {
    return;
  }

  if (e.request.mode === 'navigate') {
    // ✅ MUDANÇA AQUI: Network-First agressivo para o index.html
    // Se tiver internet, ele pega a versão nova. Se não tiver, pega do cache.
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Para os outros arquivos (CSS, JS, imagens), continua Cache-First
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse; 
        
        return fetch(e.request).then((networkResponse) => {
          const canCache = networkResponse && (
            (networkResponse.status >= 200 && networkResponse.status < 300) ||
            networkResponse.type === 'opaque'
          );
          if (canCache) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => new Response('Offline', { status: 503 }));
      });
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