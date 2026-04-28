self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Your turn', body: 'You are being called.' };
  }

  const title = payload.title || 'Your turn';
  const options = {
    body: payload.body || 'Head to the counter.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [300, 120, 300, 120, 600],
    tag: payload.tag || 'partiqle-call',
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((windows) => {
      for (const client of windows) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
