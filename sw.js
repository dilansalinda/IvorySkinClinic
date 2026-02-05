// Service Worker for Ivory Skin Clinic
// Enhanced with aggressive image caching and stale-while-revalidate strategy

const CACHE_VERSION = 'v3';
const CACHE_NAME = `ivory-cache-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `ivory-images-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `ivory-static-${CACHE_VERSION}`;

const OFFLINE_URL = './index.html';

// Critical images to precache (LCP image and logo)
const CRITICAL_IMAGES = [
  './assets/treatments/Hydra Facial.webp',
  './assets/treatments/Hydra Facial.png', // Fallback
  './assets/data/logo.webp',
  './assets/data/logo.png' // Fallback
];

// Static assets to precache
const PRECACHE_URLS = [
  './',
  './index.html',
  './blog-post-1.html',
  './blog-post-2.html',
  './blog-post-3.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './fonnts.com-The-Seasons-.otf',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-192.png',
  './assets/icons/maskable-512.png'
];

// Image cache TTL: 1 year (31536000000 ms)
const IMAGE_CACHE_TTL = 31536000000;

// Check if request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.headers.get('accept')?.includes('image') ||
         /\.(webp|png|jpg|jpeg|gif|svg|ico)$/i.test(new URL(request.url).pathname);
}

// Check if request is for a static asset (CSS, JS, fonts)
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(css|js|woff|woff2|otf|ttf|eot)$/i.test(url.pathname) ||
         request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'font';
}

// Stale-while-revalidate strategy for images
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start fetching fresh version in background
  const fetchPromise = fetch(request).then(response => {
    // Only cache successful responses
    if (response.status === 200) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }
    return response;
  }).catch(() => {
    // Network error - return cached if available
    return cachedResponse || null;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Cache-first strategy for static assets (with network fallback)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for HTML requests
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
      return caches.match(OFFLINE_URL);
    }
    throw error;
  }
}

// Network-first strategy for HTML (with cache fallback)
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback to offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL) || 
             new Response('You are offline. Please check your connection.', {
               headers: { 'Content-Type': 'text/html' }
             });
    }
    throw error;
  }
}

// Install event: Precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Precache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(PRECACHE_URLS);
      }),
      // Precache critical images
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.addAll(CRITICAL_IMAGES).catch(err => {
          // Don't fail if some images can't be cached
          console.warn('Some critical images could not be precached:', err);
        });
      })
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Delete all caches that don't match current version
            return cacheName.startsWith('ivory-') && 
                   cacheName !== CACHE_NAME &&
                   cacheName !== IMAGE_CACHE_NAME &&
                   cacheName !== STATIC_CACHE_NAME;
          })
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event: Route requests to appropriate strategy
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests from same origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  
  // Route to appropriate caching strategy
  if (isImageRequest(request)) {
    // Images: Stale-while-revalidate for instant loading with background updates
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE_NAME));
  } else if (isStaticAsset(request)) {
    // Static assets: Cache-first for performance
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    // HTML: Network-first for fresh content
    event.respondWith(networkFirst(request, CACHE_NAME));
  } else {
    // Other resources: Network-first with cache fallback
    event.respondWith(networkFirst(request, CACHE_NAME));
  }
});
