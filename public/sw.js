const CACHE_NAME = 'habit-tracker-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Update service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background sync for offline habit completion
self.addEventListener('sync', (event) => {
  if (event.tag === 'habit-sync') {
    event.waitUntil(syncHabits());
  }
});

async function syncHabits() {
  try {
    const pendingData = await getFromIndexedDB('pendingHabits');
    if (pendingData && pendingData.length > 0) {
      // Sync pending habits when online
      console.log('Syncing pending habits:', pendingData);
      // Here you would send data to your server if you had one
      await clearIndexedDB('pendingHabits');
    }
  } catch (error) {
    console.error('Error syncing habits:', error);
  }
}

// IndexedDB helper functions
function getFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitTrackerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['habits'], 'readonly');
      const store = transaction.objectStore('habits');
      const getRequest = store.get(key);
      
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => resolve(getRequest.result);
    };
  });
}

function clearIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitTrackerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Öffnen',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Schließen',
          icon: '/icon-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  
  if (event.action === 'spin-wheel') {
    event.waitUntil(
      self.clients.openWindow('/?view=rewards')
    );
  } else if (event.action === 'mark-done') {
    event.waitUntil(
      self.clients.openWindow('/?quick=true')
    );
  } else if (event.action === 'open-app') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  } else if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - handle based on notification type
    if (data.type === 'milestone') {
      event.waitUntil(
        self.clients.openWindow('/?view=rewards')
      );
    } else if (data.type === 'reminder' || data.type === 'streak-danger') {
      event.waitUntil(
        self.clients.openWindow('/?quick=true')
      );
    } else {
      event.waitUntil(
        self.clients.openWindow('/')
      );
    }
  }
});