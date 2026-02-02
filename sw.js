/* Ivory Skin Clinic - Service Worker (offline-first PWA) */
const CACHE_NAME = "ivory-cache-v2";
const OFFLINE_URL = "./index.html";

// Keep this list small and same-origin only.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./blog-post-1.html",
  "./blog-post-2.html",
  "./blog-post-3.html",
  "./styles.css",
  "./script.js",
  "./manifest.webmanifest",
  "./fonnts.com-The-Seasons-.otf",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-192.png",
  "./assets/icons/maskable-512.png",
  "./assets/data/logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for navigation, cache-first for static same-origin assets.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (req.method !== "GET") return;

  // Network-first for HTML navigations (pages)
  if (req.mode === "navigate" || req.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Only cache successful responses
          if (res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Offline: try cache, fallback to index.html
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            return caches.match(OFFLINE_URL).then((offline) => {
              if (offline) return offline;
              // Last resort: return a basic response
              return new Response("You are offline. Please check your connection.", {
                headers: { "Content-Type": "text/html" }
              });
            });
          });
        })
    );
    return;
  }

  // Cache-first for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      
      return fetch(req)
        .then((res) => {
          // Only cache successful responses
          if (res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Return a placeholder for failed image requests
          if (req.destination === "image") {
            return new Response("", { status: 404 });
          }
          throw new Error("Network request failed");
        });
    })
  );
});



