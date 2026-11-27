const CACHE_NAME = "kalamnesan-physics-v2";
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
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (_) {
          // Skip if any single optional asset isn't available yet
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip cross-origin / Supabase API / RPC calls so live exam & student data stays fresh
  if (
    url.origin !== self.location.origin ||
    url.pathname.includes("/rest/") ||
    url.pathname.includes("/rpc/") ||
    url.pathname.includes("/auth/")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        if (event.request.mode === "navigate") {
          const fallbackIndex = await caches.match("./index.html");
          if (fallbackIndex) return fallbackIndex;
        }

        return new Response("Offline - Please check your internet connection.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
