// Service Worker for PomPom PWA
// Handles caching, offline functionality, and background sync

const CACHE_NAME = 'pompom-v1.0.0';
const STATIC_CACHE_NAME = 'pompom-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'pompom-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/css/main.css',
  '/css/components.css', 
  '/css/animations.css',
  '/css/mobile.css',
  '/js/welcome.js',
  '/js/timer.js',
  '/js/audio.js',
  '/src/app.js',
  '/src/sound.js',
  '/src/utils.js',
  '/firebase-config.js',
  '/manifest.json',
  // External resources
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://www.transparenttextures.com/patterns/cubes.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip Firebase requests (let them go to network)
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            console.log('Service Worker: Network request failed:', error);
            
            // Return offline fallback for HTML requests
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Return empty response for other requests
            return new Response('', {
              status: 408,
              statusText: 'Request timeout'
            });
          });
      })
  );
});

// Background sync for timer data
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'timer-sync') {
    event.waitUntil(syncTimerData());
  }
  
  if (event.tag === 'tasks-sync') {
    event.waitUntil(syncTaskData());
  }
});

// Sync timer data when back online
async function syncTimerData() {
  try {
    // Get pending timer data from IndexedDB or localStorage
    const pendingData = await getPendingTimerData();
    
    if (pendingData && pendingData.length > 0) {
      // Send to server or Firebase
      await sendTimerDataToServer(pendingData);
      
      // Clear pending data
      await clearPendingTimerData();
      
      console.log('Service Worker: Timer data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing timer data:', error);
  }
}

// Sync task data when back online
async function syncTaskData() {
  try {
    const pendingTasks = await getPendingTaskData();
    
    if (pendingTasks && pendingTasks.length > 0) {
      await sendTaskDataToServer(pendingTasks);
      await clearPendingTaskData();
      
      console.log('Service Worker: Task data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing task data:', error);
  }
}

// Helper functions for data management
async function getPendingTimerData() {
  // Implementation would depend on your data storage strategy
  return [];
}

async function getPendingTaskData() {
  // Implementation would depend on your data storage strategy
  return [];
}

async function sendTimerDataToServer(data) {
  // Implementation for sending data to your backend
  console.log('Sending timer data:', data);
}

async function sendTaskDataToServer(data) {
  // Implementation for sending data to your backend
  console.log('Sending task data:', data);
}

async function clearPendingTimerData() {
  // Clear pending timer data from storage
}

async function clearPendingTaskData() {
  // Clear pending task data from storage
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'Your Pomodoro session is complete!',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-break',
        title: 'Start Break',
        icon: '/images/action-break.png'
      },
      {
        action: 'start-focus',
        title: 'Start Focus',
        icon: '/images/action-focus.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'PomPom Timer';
  }

  event.waitUntil(
    self.registration.showNotification('PomPom Timer', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  const action = event.action;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            if (action === 'start-break') {
              client.postMessage({ action: 'setMode', mode: 'shortBreak' });
            } else if (action === 'start-focus') {
              client.postMessage({ action: 'setMode', mode: 'pomodoro25' });
            }
            return client.focus();
          }
        }
        
        // If app is not open, open it
        let url = '/';
        if (action === 'start-break') {
          url = '/?mode=break';
        } else if (action === 'start-focus') {
          url = '/?mode=focus';
        }
        
        return clients.openWindow(url);
      })
  );
});

// Message handling from main app
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_TIMER_DATA') {
    // Cache timer data for offline sync
    cacheTimerData(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CACHE_TASK_DATA') {
    // Cache task data for offline sync
    cacheTaskData(event.data.payload);
  }
});

// Cache data for offline sync
function cacheTimerData(data) {
  // Implementation for caching timer data
  console.log('Caching timer data:', data);
}

function cacheTaskData(data) {
  // Implementation for caching task data
  console.log('Caching task data:', data);
}
