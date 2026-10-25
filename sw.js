const CACHE_NAME = 'gym-workout-v51';

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
    e.respondWith(
      Promise.race([
        fetch(e.request, { cache: 'no-store' }).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return networkResponse;
        }),
        new Promise((_, reject) => setTimeout(reject, 3000))
      ]).catch(() => {
        return caches.match(e.request).then((cached) => {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        const canCache = networkResponse && (
          (networkResponse.status >= 200 && networkResponse.status < 300) ||
          networkResponse.type === 'opaque'
        );
        if (canCache) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkResponse;
      }).catch(() => new Response('Offline', { status: 503 }));

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