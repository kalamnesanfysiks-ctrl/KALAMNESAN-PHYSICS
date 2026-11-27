const CACHE_NAME = "kalamnesan-physics-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./exam.html",
  "./admin.html",
  "./manifest.json",
  "./kalam.png",
  "./signature.png",
  "./tracks-config.js",
  "./step2-navigation.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Always go network-first for Supabase API / cross-origin calls so live data & answers stay fresh
  if (url.origin !== self.location.origin || url.pathname.includes("/rest/") || url.pathname.includes("/rpc/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
