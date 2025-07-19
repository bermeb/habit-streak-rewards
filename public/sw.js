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

// Handle background sync for offline habit completion and notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'habit-sync') {
    event.waitUntil(syncHabits());
  } else if (event.tag === 'streak-danger-check') {
    event.waitUntil(checkStreakDangers());
  }
});

// Periodic background sync (for supporting browsers)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic background sync triggered:', event.tag);
  
  if (event.tag === 'streak-danger-check') {
    event.waitUntil(checkStreakDangers());
  }
});

// Handle app visibility changes to trigger sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_STREAKS') {
    checkStreakDangers();
  }
});

// Check for streak dangers in background
function checkStreakDangers() {
  return new Promise((resolve) => {
    try {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]');
      const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
      
      if (!notificationsEnabled || !habits.length) {
        resolve();
        return;
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const habitsAtRisk = [];
      
      habits.forEach(habit => {
        if (habit.streak > 0 && habit.lastCompleted) {
          const lastCompletedDate = new Date(habit.lastCompleted);
          const daysSinceCompleted = Math.floor((now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Check if habit was completed today
          const completedToday = habit.completedDates && habit.completedDates.includes(today);
          
          if (!completedToday && daysSinceCompleted >= 1) {
            const daysLeft = Math.max(0, 1 - (daysSinceCompleted - 1));
            habitsAtRisk.push({ name: habit.name, daysLeft });
          }
        }
      });

      // Only show notification if there are habits at risk and we haven't shown one today
      if (habitsAtRisk.length > 0) {
        const lastWarningKey = `streak-warning-multiple-${today}`;
        const lastWarning = localStorage.getItem(lastWarningKey);
        
        if (!lastWarning) {
          showMultipleStreakDangerNotification(habitsAtRisk);
          localStorage.setItem(lastWarningKey, 'shown');
        }
      }
      
      resolve();
    } catch (error) {
      console.error('Error checking streak dangers in background:', error);
      resolve();
    }
  });
}

// Show consolidated notification for multiple habits at risk
function showMultipleStreakDangerNotification(habitsAtRisk) {
  const habitCount = habitsAtRisk.length;
  const habitNames = habitsAtRisk.map(h => h.name).join(', ');
  
  const title = '⚠️ Deine Streaks sind in Gefahr!';
  const message = habitCount === 1 
    ? `${habitsAtRisk[0].name}: Nur noch ${habitsAtRisk[0].daysLeft} Tag(e) bis dein Streak verloren geht!`
    : `${habitCount} Habits brauchen deine Aufmerksamkeit: ${habitNames}`;
    
  self.registration.showNotification(title, {
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'streak-danger-multiple',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      type: 'streak-danger-multiple',
      habitsAtRisk
    },
    actions: [
      {
        action: 'open-app',
        title: 'Jetzt abhaken',
        icon: '/icon-192x192.png'
      }
    ]
  });
}

// Legacy function kept for compatibility
function showNotification(habitName, daysLeft) {
  const title = '⚠️ Streak in Gefahr!';
  const message = daysLeft > 0 
    ? `${habitName}: Noch ${daysLeft} Tag${daysLeft > 1 ? 'e' : ''} um deinen Streak zu retten!`
    : `${habitName}: Dein Streak ist heute in Gefahr!`;
    
  self.registration.showNotification(title, {
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `streak-danger-${habitName}`,
    requireInteraction: true,
    actions: [
      {
        action: 'complete',
        title: 'Jetzt erledigen'
      },
      {
        action: 'dismiss',
        title: 'Später'
      }
    ]
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'complete') {
    // Open the app to the quick check page
    event.waitUntil(
      clients.openWindow('/?quick=true')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Open the main app
    event.waitUntil(
      clients.openWindow('/')
    );
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
    } else if (data.type === 'reminder' || data.type === 'streak-danger' || data.type === 'streak-danger-multiple') {
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